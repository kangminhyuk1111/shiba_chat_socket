// frontend js

// const sessionUserid = '<%- JSON.stringify(userInfo) %>';

// socket 사용을 위해서 객체 생성
let socket = io.connect();
let myNick;
const chatList = document.querySelector('#chat-list');
const chatBox = document.querySelector(".chat-box");
const now = new Date(); // 현재 시간
const utcNow = now.getTime() + (now.getTimezoneOffset() * 60 * 1000); // 현재 시간을 utc로 변환한 밀리세컨드값
const koreaTimeDiff = 9 * 60 * 60 * 1000; // 한국 시간은 UTC보다 9시간 빠름(9시간의 밀리세컨드 표현)
const koreaNow = new Date(utcNow + koreaTimeDiff); // utc로 변환된 값을 한국 시간으로 변환시키기 위해 9시간(밀리세컨드)를 더함
const hours = koreaNow.getHours();
const minutes = koreaNow.getMinutes();

socket.on('connect', () => {
    console.log('⭕️ Client Socket Connected >> ', socket.id);
});

socket.on('userCount', (count) => {
    console.log(count)
    document.querySelector('#user-count').textContent = `${count}명 접속중 !`
})

socket.on('userComein', (data) => {
    console.log(data)
    chatList.insertAdjacentHTML('beforeend', `<p id="user-count">${data}</p>`);
})

socket.on('entrySuccess', (nickname) => {
    myNick = nickname;
    document.querySelector('.chat-box').classList.remove('d-none');
    document.querySelector('#nickname').disabled = true;
    document.querySelector('.entry-box > button').disabled = true;
})

socket.on('updateNicks', (obj) => {
    let nickList = document.querySelector('#nick-list');
    let options = `<option value="all">전체</option>`;
    for (let key in obj) {
        options += `<option value="${key}">${obj[key]}</option>`;
    }
    document.querySelector('#nick-list').innerHTML = options;
})

socket.on('getMsg', (data) => {
    let getMsgFinder = allUsers.find(e => e.nickname == data.who);
    // console.log(allUsers)
    // console.log(getMsgFinder);
    chatList.scrollTop = chatList.scrollHeight
    if (myNick == data.who) {
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const div3 = document.createElement('div');
        const div4 = document.createElement('div');
        const p1 = document.createElement('p');
        const p2 = document.createElement('p');
        const img = document.createElement('img');
        div1.setAttribute("class", 'my-chat');
        if (getMsgFinder) {
            img.setAttribute('src', getMsgFinder.profileImg);
        } else {
            img.setAttribute('src', '/uploads/shiba-default.jpg');
        }
        p1.setAttribute('class', 'mb-0');
        p1.innerText = data.who;
        p2.setAttribute('class', 'chatting-box')
        p2.innerText = data.msg;
        div3.setAttribute('id', "profile-img");
        div4.setAttribute('class', 'time-setter');
        div4.innerText = `${hours}:${minutes}`
        div2.append(p1)
        div2.append(p2)
        div3.append(img)
        div1.append(div4)
        div1.append(div2)
        div1.append(div3)
        chatList.append(div1);
    } else if (myNick != data.who) {
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const div3 = document.createElement('div');
        const div4 = document.createElement('div');
        const p1 = document.createElement('p');
        const p2 = document.createElement('p');
        const img = document.createElement('img');
        div1.setAttribute("class", 'other-chat');
        if (getMsgFinder) {
            img.setAttribute('src', getMsgFinder.profileImg);
        } else {
            img.setAttribute('src', '/uploads/shiba-default.jpg');
        }
        p1.setAttribute('class', 'mb-0');
        p1.innerText = data.who;
        p2.setAttribute('class', 'chatting-box-other')
        p2.innerText = data.msg;
        div3.setAttribute('id', "profile-img");
        div4.setAttribute('class', 'time-setter');
        div4.innerText = `${hours}:${minutes}`
        div3.append(img);
        div2.append(p1)
        div2.append(p2)
        div1.append(div3)
        div1.append(div2)
        div1.append(div4)
        chatList.append(div1);
    }

})

socket.on('secretMsg', (data) => {
    chatList.scrollTop = chatList.scrollHeight
    if (myNick == data.who) {
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        div1.setAttribute("class", 'my-chat');
        div2.innerHTML = `${data.user}에게 : ${data.msg}`
        div2.setAttribute("id", "bg-purple");
        div1.append(div2)
        chatList.append(div1);
    } else {
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        div1.setAttribute("class", 'other-chat');
        div2.innerHTML = `(귓속말) ${data.who} : ${data.msg}`
        div2.setAttribute("id", 'bg-purple');
        div1.append(div2)
        chatList.append(div1);
    }

})

socket.on('error', (data) => {
    alert('닉네임 에러 !')
})

socket.on('userOut', (data) => {
    if (data == undefined) {
        return;
    }
    const p = document.createElement('p');
    p.setAttribute('id', 'user-count');
    p.innerHTML = `${data}님이 퇴장하였습니다.`;
    chatList.append(p);
})

function entry() {
    socket.emit('setNick', document.querySelector('#nickname').value);
}

function sendMsg() {
    if (!document.querySelector('#message').value) {
        Swal.fire(
            '실패..',
            '공백은 전송할 수 없습니다 !',
            'error'
        )
        return;
    }
    socket.emit('sendMsg', ([document.querySelector('#message').value, document.querySelector('#nick-list').value]));
    document.querySelector('#message').value = '';
}

const userData = async () => {
    const id = document.querySelector("#loginId").value
    const pw = document.querySelector("#loginPw").value
    const result = await axios({
        method: 'POST',
        url: '/login',
        data: {
            userId: id,
            userPw: pw,
        }
    })
    if (result.data == true) {
        Swal.fire({
            title: '성공 !',
            text: '로그인 성공 !',
            icon: 'success',
            confirmButtonColor: '#ffc107',
            confirmButtonText: 'OK'
        }).then(result => {
            if (result.isConfirmed == true) {
                window.location.href = '/';
            }
        })
        // window.location.href = "/";
    } else {
        Swal.fire(
            '실패..',
            '로그인 실패...',
            'error'
        )
    }
}

const logout = () => {
    axios({
        method: "POST",
        url: "/logout",
        data: true,
    }).then((res) => {
        window.location.href = "/";
    });
}