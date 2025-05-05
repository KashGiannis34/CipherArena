<script>
    import { io } from 'socket.io-client';

    let { data } = $props();
    console.log('Data:', data);

    const socket = io();

    socket.on('connect', (message) => {
        console.log('You are connected with id', socket.id);
    });

    socket.emit('join-room', data['roomID']);
</script>