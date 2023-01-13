const img = document.getElementById('img')
    const socket = io()
    socket.on('message', msg => {
        document.getElementById('text').innerText = msg
    })
    socket.on('siap', msg => {
        document.getElementById('text2').innerText = msg
    })
    socket.on('qr', src => {
        img.src = src

        // setInterval(()=>{
        //     img.src = src
        // }, 500)

        
        // setInterval(()=>{
        //     setTimeout(()=>{
        //         img.src = ""
        //     }, 500)
        // }, 60000)
    })

    socket.on('auth', msg => {
        document.getElementById('text3').innerText = msg
    })