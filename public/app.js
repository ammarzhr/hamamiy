document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const homeScreen = document.getElementById('home-screen');
    const roomScreen = document.getElementById('room-screen');
    const createRoomBtn = document.getElementById('create-room-btn');
    const joinRoomBtn = document.getElementById('join-room-btn');
    const joinRoomIdInput = document.getElementById('join-room-id');
    const roomIdDisplay = document.getElementById('room-id');
    const copyRoomIdBtn = document.getElementById('copy-room-id');
    const toggleAudioBtn = document.getElementById('toggle-audio-btn');
    const localAudioIndicator = document.getElementById('local-audio-indicator');
    const leaveRoomBtn = document.getElementById('leave-room-btn');
    const usersList = document.getElementById('users-list');
    const userCount = document.getElementById('user-count');

    // App state
    let currentRoom = null;
    let localStream = null;
    let peers = {};
    let myPeerId = null;
    let myUsername = '';
    let isMuted = false;
    
    // User data for peers
    let peerUserData = {};

    // Initialize PeerJS
    // Using the cloud PeerJS server for deployment
    const peer = new Peer();
    
    // For local development, you can use this instead:
    // const peer = new Peer({
    //     host: 'localhost',
    //     port: 9000,
    //     path: '/myapp'
    // });

    peer.on('open', (id) => {
        console.log('My peer ID is:', id);
        myPeerId = id;
    });

    // Handle incoming calls
    peer.on('call', (call) => {
        console.log('Receiving call from:', call.peer);
        
        // Create metadata with our username to send back
        const metadata = {
            username: myUsername
        };
        
        // Answer the call with our local stream and metadata
        call.answer(localStream);
        
        // Add this peer to our connections
        const peerId = call.peer;
        peers[peerId] = call;
        
        // Listen for their stream
        call.on('stream', (remoteStream) => {
            console.log('Received remote stream from:', peerId);
            
            // Get the username from metadata if available
            let peerUsername = '';
            if (call.metadata && call.metadata.username) {
                peerUsername = call.metadata.username;
                peerUserData[peerId] = { username: peerUsername };
            }
            
            addUserToList(peerId, false, peerUsername);
            updateUserCount();
        });
        
        // Handle call ending
        call.on('close', () => {
            console.log('Call with peer ended:', peerId);
            removeUserFromList(peerId);
            delete peers[peerId];
            delete peerUserData[peerId];
            updateUserCount();
        });
    });

    // Error handling
    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        alert(`Connection error: ${err.type}`);
    });

    // Create a new room
    createRoomBtn.addEventListener('click', async () => {
        // Get username
        const usernameInput = document.getElementById('username-input');
        const username = usernameInput.value.trim();
        
        if (!username) {
            alert('Please enter your name before creating a room');
            usernameInput.focus();
            return;
        }
        
        // Set username
        myUsername = username;
        
        try {
            // Get audio stream
            localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            
            // Generate a random room ID
            currentRoom = generateRoomId();
            
            // Show room screen
            homeScreen.classList.add('hidden');
            roomScreen.classList.remove('hidden');
            
            // Display room ID
            roomIdDisplay.textContent = currentRoom;
            
            console.log('Created room:', currentRoom);
            
            // Add self to users list
            addUserToList(myPeerId, true);
            updateUserCount();
            
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Could not access microphone. Please ensure you have given permission.');
        }
    });

    // Join an existing room
    joinRoomBtn.addEventListener('click', async () => {
        // Get username
        const usernameInput = document.getElementById('username-input');
        const username = usernameInput.value.trim();
        
        if (!username) {
            alert('Please enter your name before joining a room');
            usernameInput.focus();
            return;
        }
        
        // Set username
        myUsername = username;
        
        const roomId = joinRoomIdInput.value.trim();
        
        if (!roomId) {
            alert('Please enter a room ID');
            return;
        }
        
        try {
            // Get audio stream
            localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            
            // Set current room
            currentRoom = roomId;
            
            // Show room screen
            homeScreen.classList.add('hidden');
            roomScreen.classList.remove('hidden');
            
            // Display room ID
            roomIdDisplay.textContent = currentRoom;
            
            console.log('Joined room:', currentRoom);
            
            // Connect to all existing peers in the room
            // In a real app, you would need a signaling server to know who's in the room
            // For simplicity, we'll assume the room ID contains the host's peer ID
            
            // This is a simplified example - in a real app you'd get the peers from a signaling server
            const hostPeerId = roomId; // In this simple example, room ID is the host's peer ID
            
            if (hostPeerId && hostPeerId !== myPeerId) {
                connectToPeer(hostPeerId);
            }
            
            // Add self to users list
            addUserToList(myPeerId, true);
            updateUserCount();
            
        } catch (error) {
            console.error('Error joining room:', error);
            alert('Could not access microphone. Please ensure you have given permission.');
        }
    });

    // Connect to a peer
    function connectToPeer(peerId) {
        console.log('Connecting to peer:', peerId);
        
        // Add metadata to the call (username)
        const metadata = {
            username: myUsername
        };
        
        const call = peer.call(peerId, localStream, { metadata: metadata });
        peers[peerId] = call;
        
        call.on('stream', (remoteStream) => {
            console.log('Received remote stream from:', peerId);
            
            // Get the username from metadata if available
            let peerUsername = '';
            if (call.metadata && call.metadata.username) {
                peerUsername = call.metadata.username;
                peerUserData[peerId] = { username: peerUsername };
            }
            
            addUserToList(peerId, false, peerUsername);
            updateUserCount();
        });
        
        call.on('close', () => {
            console.log('Call with peer ended:', peerId);
            removeUserFromList(peerId);
            delete peers[peerId];
            delete peerUserData[peerId];
            updateUserCount();
        });
    }

    // Generate a random room ID (using the peer ID for simplicity)
    function generateRoomId() {
        return myPeerId;
    }

    // Copy room link to clipboard
    copyRoomIdBtn.addEventListener('click', () => {
        const roomLink = `${window.location.origin}?room=${currentRoom}`;
        navigator.clipboard.writeText(roomLink)
            .then(() => {
                alert('Room link copied to clipboard!');
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                // Fallback
                const tempInput = document.createElement('input');
                tempInput.value = roomLink;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                alert('Room link copied to clipboard!');
            });
    });

    // Toggle local audio
    toggleAudioBtn.addEventListener('click', () => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                const isEnabled = audioTracks[0].enabled;
                audioTracks[0].enabled = !isEnabled;
                
                // Update UI
                isMuted = !isEnabled;
                if (isMuted) {
                    toggleAudioBtn.textContent = 'Unmute';
                    toggleAudioBtn.classList.replace('bg-red-500', 'bg-green-500');
                    toggleAudioBtn.classList.replace('hover:bg-red-600', 'hover:bg-green-600');
                    localAudioIndicator.classList.replace('bg-green-500', 'bg-red-500');
                } else {
                    toggleAudioBtn.textContent = 'Mute';
                    toggleAudioBtn.classList.replace('bg-green-500', 'bg-red-500');
                    toggleAudioBtn.classList.replace('hover:bg-green-600', 'hover:bg-red-600');
                    localAudioIndicator.classList.replace('bg-red-500', 'bg-green-500');
                }
            }
        }
    });

    // Leave the room
    leaveRoomBtn.addEventListener('click', () => {
        // Close all peer connections
        Object.values(peers).forEach(call => call.close());
        peers = {};
        
        // Stop local stream
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
        }
        
        // Reset UI
        usersList.innerHTML = '';
        currentRoom = null;
        
        // Show home screen
        roomScreen.classList.add('hidden');
        homeScreen.classList.remove('hidden');
        
        console.log('Left room');
    });

    // Add user to the list
    function addUserToList(peerId, isMe = false, username = '') {
        const userItem = document.createElement('li');
        userItem.id = `user-${peerId}`;
        userItem.className = 'flex items-center space-x-2 py-2';
        
        let displayName;
        if (isMe) {
            displayName = myUsername + ' (Me)';
        } else if (username) {
            displayName = username;
        } else {
            displayName = 'User ' + peerId.substr(0, 5);
        }
        
        userItem.innerHTML = `
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>${displayName}</span>
        `;
        
        usersList.appendChild(userItem);
    }

    // Remove user from the list
    function removeUserFromList(peerId) {
        const userItem = document.getElementById(`user-${peerId}`);
        if (userItem) {
            userItem.remove();
        }
    }

    // Update user count
    function updateUserCount() {
        const count = usersList.childElementCount;
        userCount.textContent = count;
    }

    // Check URL for room parameter to auto-join
    function checkUrlForRoom() {
        const urlParams = new URLSearchParams(window.location.search);
        const roomParam = urlParams.get('room');
        
        if (roomParam) {
            joinRoomIdInput.value = roomParam;
            // Focus the username input to prompt the user to enter their name
            document.getElementById('username-input').focus();
            // Display a message to let them know they need to enter their name
            if (roomParam) {
                alert('Please enter your name to join the room');
            }
        }
    }
    
    // Run on page load
    checkUrlForRoom();
});
