document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const statusDiv = document.getElementById('status');
    const audioOutput = document.getElementById('audioOutput');
    
    let peerConnection = null;
    let mediaStream = null;
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        statusDiv.className = 'status disconnected';
        statusDiv.textContent = 'Status: Error - WebRTC is not supported in this browser';
        startButton.disabled = true;
        console.error('WebRTC is not supported in this browser');
        return;
    }
    
    startButton.addEventListener('click', async () => {
        try {
            statusDiv.className = 'status connecting';
            statusDiv.textContent = 'Status: Connecting...';
            
            peerConnection = new RTCPeerConnection();
            
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    audio: true
                });
            } catch (mediaError) {
                console.error('Media error:', mediaError);
                if (mediaError.name === 'NotAllowedError') {
                    throw new Error('Microphone access denied. Please allow microphone access and try again.');
                } else if (mediaError.name === 'NotFoundError') {
                    throw new Error('No microphone detected. Please connect a microphone and try again.');
                } else {
                    throw mediaError;
                }
            }
            
            await setupWebRTC(peerConnection, mediaStream);
            
            startButton.disabled = true;
            stopButton.disabled = false;
            statusDiv.className = 'status connected';
            statusDiv.textContent = 'Status: Connected';
        } catch (error) {
            console.error('Error starting microphone:', error);
            statusDiv.className = 'status disconnected';
            statusDiv.textContent = `Status: Error - ${error.message}`;
            
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
                mediaStream = null;
            }
            
            if (peerConnection) {
                peerConnection.close();
                peerConnection = null;
            }
        }
    });
    
    stopButton.addEventListener('click', () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
        
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
        
        startButton.disabled = false;
        stopButton.disabled = true;
        statusDiv.className = 'status disconnected';
        statusDiv.textContent = 'Status: Disconnected';
    });
    
    async function setupWebRTC(pc, stream) {
        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });
        
        pc.addEventListener('track', (event) => {
            if (audioOutput && audioOutput.srcObject !== event.streams[0]) {
                audioOutput.srcObject = event.streams[0];
            }
        });
        
        const dataChannel = pc.createDataChannel('text');
        
        dataChannel.addEventListener('message', (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log('Received message:', message);
                
                if (message.type === 'log') {
                    if (message.data === 'pause_detected') {
                        console.log('Pause detected in speech');
                    } else if (message.data === 'response_starting') {
                        console.log('Response starting');
                    }
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });
        
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        const response = await fetch('/webrtc/offer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sdp: offer.sdp,
                type: offer.type,
                webrtc_id: Math.random().toString(36).substring(7)
            })
        });
        
        const serverResponse = await response.json();
        await pc.setRemoteDescription(serverResponse);
    }
}); 