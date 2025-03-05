# FastRTC POC
A simple POC for a fast real-time chat application using FastAPI and FastRTC. I wanted to make one as an example with HTML, rather than just Gradio.

## Setup
1. Set your Deepseek API key in an `.env` file based on the `.env.example` file
2. Create a virtual environment and install the dependencies
    ```bash
    python3 -m venv env
    source env/bin/activate
    pip install -r requirements.txt
    ```

3. Run the server
    ```bash
    ./run.sh
    ```

4. Go to `http://localhost:8000` in your browser

5. Click the "Start Microphone" button and start chatting!

