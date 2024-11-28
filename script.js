 // MQTT Configuration
 const brokerUrl = 'wss://broker.hivemq.com:8884/mqtt';
 const topic = 'data';
 const clientId = 'webclient_' + Math.random().toString(16).substr(2, 8);

 let messageCount = 0; // Penghitung pesan buatnyesuain warnanya 
 let alpha = 0.1; // nilai awal buat transparansi wrna

 // buat nyambung ke broker
 const client = mqtt.connect(brokerUrl, {
     clientId: clientId,
     clean: true,
     connectTimeout: 4000,
     reconnectPeriod: 1000,
 });

 // DOM elements
 const statusElement = document.getElementById('connectionStatus');
 const messagesElement = document.getElementById('messages');
 const puzzleTable = document.getElementById('messagePuzzle').getElementsByTagName('tbody')[0];

 // ini buat ngitung warna biru sesuai jumlah
 function getBlueColor() {
     const color = `rgba(0, 0, 255, ${alpha})`;
     alpha += 0.1; // Increment alpha
     if (alpha > 1) alpha = 0.1; // ini buat puzzle klo udah ketmu warna biru tua nnti blik lagi ke muda ,tpi umurlu tetep tua
     return color;
 }

 // klo ini mah buat konek ga koneknya ya
 client.on('connect', () => {
     alert('Connected to MQTT broker');
     statusElement.textContent = 'Connected to MQTT broker';
     statusElement.className = 'status connected';
     
     

     // buat topiknya (asli gua ga tau buat inputnya sesuai dngn yg kita pngen klo pke broker)
     client.subscribe(topic, (err) => {
         if (!err) {
             console.log(`Subscribed to ${topic}`);
             addMessage('System', `Subscribed to topic: ${topic}`);
         }
       
     });
 });

 // untuk pesan masuk
 client.on('message', (topic, message) => {
     const messageStr = message.toString();
     alert(`ada data yang masuk nich : ${messageStr}`);
     addMessage(topic, messageStr);
     addPuzzleMessage(messageStr);
     
 });

 // buat klo koneksi terputus, kaya hubungan lu
 client.on('offline', () => {
     console.log('Lost connection to MQTT broker');
     statusElement.textContent = 'Disconnected from MQTT broker';
     statusElement.className = 'status disconnected';
 });

 // buat ketika error
 client.on('error', (error) => {
     console.error('MQTT Error:', error);
     addMessage('Error', error.message);
 });

 // Function buat nampilin pesan
 function addMessage(source, message) {
     const messageElement = document.createElement('div');
     messageElement.className = 'message';
     const timestamp = new Date().toLocaleTimeString();
     messageElement.textContent = `[${timestamp}] ${source}: ${message}`;
     messagesElement.appendChild(messageElement);
     messagesElement.scrollTop = messagesElement.scrollHeight;
 }

 // Function buat bikin puzzle
 function addPuzzleMessage(message) {
    const rows = puzzleTable.rows;
    messageCount++; // Increment message counter
    let added = false;

    // 
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].cells;
        for (let j = 0; j < cells.length; j++) {
            if (!cells[j].textContent) {
                cells[j].textContent = message;
                cells[j].style.backgroundColor = getBlueColor();
                added = true;
                break;
            }
        }
        if (added) break;
    }

    //
    if (!added) {
        const newRow = puzzleTable.insertRow();
        for (let i = 0; i < 3; i++) { // Create 3 new cells
            const newCell = newRow.insertCell();
            if (i === 0) {
                newCell.textContent = message; // Add the message to the first cell
                newCell.style.backgroundColor = getBlueColor();
            }
        }
    }
}