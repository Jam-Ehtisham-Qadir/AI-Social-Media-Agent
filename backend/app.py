from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
import base64
import tempfile
import shutil
from openai import OpenAI

load_dotenv()

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
SERPER_API_KEY = os.getenv('SERPER_API_KEY')


def search_web(query):
    url = "https://google.serper.dev/search"
    headers = {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {"q": query, "num": 5}
    response = requests.post(url, headers=headers, json=payload)
    data = response.json()

    results = []
    if "organic" in data:
        for item in data["organic"][:5]:
            results.append({
                "title": item.get("title", ""),
                "snippet": item.get("snippet", ""),
                "link": item.get("link", "")
            })
    return results


def research_topic(topic):
    search_results = search_web(topic)
    research_text = f"Topic: {topic}\n\nWeb Research Results:\n"
    for i, result in enumerate(search_results, 1):
        research_text += f"\n{i}. {result['title']}\n{result['snippet']}\nSource: {result['link']}\n"
    return research_text


def analyze_image(file_path):
    """Analyze image using GPT-4o Vision"""
    with open(file_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    ext = file_path.split(".")[-1].lower()
    mime_map = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp"}
    mime_type = mime_map.get(ext, "image/jpeg")

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime_type};base64,{image_data}"
                        }
                    },
                    {
                        "type": "text",
                        "text": "Describe this image in detail. Include: what is shown, the mood/tone, colors, any text visible, and what message or story it conveys. This description will be used to create social media posts."
                    }
                ]
            }
        ],
        max_tokens=500
    )
    return response.choices[0].message.content


def analyze_video(file_path):
    """Extract frames from video and analyze using GPT-4o Vision"""
    try:
        import cv2
        cap = cv2.VideoCapture(file_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        duration = total_frames / fps if fps > 0 else 0

        # Extract 4 frames evenly distributed
        frame_indices = [int(total_frames * i / 4) for i in range(4)]
        frames_b64 = []

        for idx in frame_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if ret:
                import cv2
                _, buffer = cv2.imencode(".jpg", frame)
                frames_b64.append(base64.b64encode(buffer).decode("utf-8"))

        cap.release()

        if not frames_b64:
            return "Could not extract frames from video."

        content = []
        for frame_b64 in frames_b64:
            content.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{frame_b64}"}
            })
        content.append({
            "type": "text",
            "text": f"These are frames extracted from a {duration:.0f}-second video. Describe what this video is about, its mood, key visuals, any text or people shown, and what story or message it conveys. This will be used to create social media posts."
        })

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": content}],
            max_tokens=500
        )
        return response.choices[0].message.content

    except ImportError:
        return "Video analysis requires opencv-python. Install it with: pip install opencv-python"


def generate_posts(topic, research, media_context=None):
    media_section = ""
    if media_context:
        media_section = f"\nMedia Analysis (attached file):\n{media_context}\n\nIMPORTANT: Incorporate the media context naturally into the posts — reference what is shown/depicted when relevant.\n"

    prompt = f"""You are a world-class social media strategist and SEO content expert. Based on the research below, create highly optimized, professional, and engaging social media posts.

Topic: {topic}

Research:
{research}
{media_section}
STRICT RULES FOR ALL POSTS:
- Never use markdown formatting like **bold** or *italic* — write in plain natural text only
- Never use asterisks, dashes as bullet points, or any markdown syntax
- Write in a natural human voice, not robotic or listicle style
- All posts must be SEO-friendly with strategic keyword placement
- Posts must feel authentic, not AI-generated

LINKEDIN POST RULES:
- Start with a powerful hook sentence that grabs attention immediately
- Professional but conversational tone — like a thought leader speaking
- 180-220 words minimum — do not cut short
- Weave in keywords naturally throughout the post
- Include 2-3 line breaks between paragraphs for readability
- End with a thought-provoking question or strong call to action
- Add 5-7 highly relevant hashtags on a new line at the end

TWITTER/X POST RULES:
- Must be between 240-270 characters — strictly enforce this length
- Start with a bold statement or surprising fact, NOT a question
- Middle: add context or insight in one sentence
- End with a short punchy question (max 8 words)
- Add 2 hashtags naturally inline, not at the end
- Never start with "Did you know" — be more direct and assertive

INSTAGRAM POST RULES:
- Start with an eye-catching opening line
- Conversational and inspiring tone with natural emojis (not excessive)
- 150-180 words minimum
- Short paragraphs with line breaks for easy reading
- End with an engaging question to drive comments
- Add 15 highly relevant SEO hashtags on a new line at the end

Format your response EXACTLY like this with no extra text before or after:
---LINKEDIN---
[linkedin post here]
---TWITTER---
[twitter post here]
---INSTAGRAM---
[instagram post here]
"""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an expert social media content creator who writes viral, engaging posts."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=2000
    )
    return response.choices[0].message.content


def parse_posts(raw_response):
    posts = {"linkedin": "", "twitter": "", "instagram": ""}
    try:
        linkedin_start = raw_response.find("---LINKEDIN---") + len("---LINKEDIN---")
        twitter_start = raw_response.find("---TWITTER---")
        instagram_start = raw_response.find("---INSTAGRAM---") + len("---INSTAGRAM---")
        twitter_content_start = twitter_start + len("---TWITTER---")

        posts["linkedin"] = raw_response[linkedin_start:twitter_start].strip()
        posts["twitter"] = raw_response[twitter_content_start:raw_response.find("---INSTAGRAM---")].strip()
        posts["instagram"] = raw_response[instagram_start:].strip()
    except Exception as e:
        posts["linkedin"] = raw_response
        posts["twitter"] = raw_response
        posts["instagram"] = raw_response
    return posts


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "message": "Social Media Agent API is running"})


@app.route('/generate', methods=['POST'])
def generate():
    topic = request.form.get('topic', '').strip()
    file = request.files.get('file')

    if not topic:
        return jsonify({"error": "No topic provided"}), 400

    try:
        # Step 1: Research topic
        research = research_topic(topic)

        # Step 2: Analyze media if attached
        media_context = None
        if file and file.filename:
            temp_dir = tempfile.mkdtemp()
            temp_path = os.path.join(temp_dir, file.filename)
            file.save(temp_path)

            ext = file.filename.lower().split('.')[-1]
            if ext in ['jpg', 'jpeg', 'png', 'webp']:
                media_context = analyze_image(temp_path)
            elif ext in ['mp4', 'mov', 'avi', 'mkv']:
                media_context = analyze_video(temp_path)

            shutil.rmtree(temp_dir)

        # Step 3: Generate posts
        raw_response = generate_posts(topic, research, media_context)

        # Step 4: Parse posts
        posts = parse_posts(raw_response)

        return jsonify({
            "success": True,
            "topic": topic,
            "posts": posts,
            "media_analyzed": media_context is not None
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run(debug=True, port=5000)