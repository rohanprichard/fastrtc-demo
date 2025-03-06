# FastRTC POC
A simple POC for a fast real-time chat application using FastAPI and FastRTC. I wanted to make one as an example with HTML, rather than just Gradio.

## Setup
1. Set your OpenAI API key in an `.env` file based on the `.env.example` file
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
4. Navigate into the frontend directory
    ```bash
    cd frontend/fastrtc-demo
    ```
5. Run the frontend
    ```bash
    npm install
    npm run dev
    ```
6. Click the microphone icon and start chatting!

7. Reset chats by clicking the trash button on the bottom right

