![ezgif com-video-to-gif (10)](https://github.com/kangminhyuk1111/shiba_chat_socket/assets/96116158/d39cd618-ebff-42dd-983e-5fd61ed781f4)

# 풀스택 채팅 앱 시바챗 ejs + socket.io

Live Link : [http://115.85.180.211:8001/](http://115.85.180.211:8001/)

## 역할분담

1인 프로젝트이기 때문에 혼자 진행하였다.

## 맡은부분

혼자서 디자인 및 기능구현을 했다.

메인 기능은 [socket.io](http://socket.io) 를 이용한 실시간 채팅 앱이 목표였다.

기간이 약 3일로 짧은기간동안 타이트하게 진행되었기 때문에

기획은 최대한 머릿속으로 간단하게 진행후

프로젝트를 진행하면서 그때 그때 수정하는 식으로 개발했다.

## 기능

- socket.io를 이용한 실시간 채팅 구현

![ezgif com-video-to-gif (10)](https://github.com/kangminhyuk1111/shiba_chat_socket/assets/96116158/c89ae83c-ba75-4f09-ac35-2d6a27d5dc76)

- three.js로 3d 모델링 파일을 웹에서 구현

![ezgif com-video-to-gif (9)](https://github.com/kangminhyuk1111/shiba_chat_socket/assets/96116158/9f28b0cb-449e-43c5-8000-3abafc3710d0)

- DB(MySQL) 연동으로 백엔드 서버에서 회원가입, 로그인 로직 구현

![ezgif com-video-to-gif (11)](https://github.com/kangminhyuk1111/shiba_chat_socket/assets/96116158/24fc9ec9-59f3-47dd-8a60-f813996b1697)

- multer를 사용하여 사진 업로드기능을 구현후 유저의 profile에 등록 및 채팅앱에 연동

- Modal을 이용하여 사용자의 프로필 수정창 구현

![ezgif com-video-to-gif (12)](https://github.com/kangminhyuk1111/shiba_chat_socket/assets/96116158/6d921e99-0659-429b-920c-e35976b868bb)

## 작업 내용 및 트러블 슈팅 내용

서브 기능중 하나인 three.js를 이용한 3d모델링 파일을 구현할때의 문제가 있었다.

three.js로 랜더링을 하는데에 까지는 문제가 크게없었지만

orbitControl ( 마우스의 움직임을 따라 3d물체가 움직임) 을 구현함의 어려움을 겪었다.

```jsx
const controls = new OrbitControls(camera, renderer.domElement);
      controls.update();
```

OrbitControls 객체를 생성하여 매개변수로 camera와 domElement를 넣었을때

정상적으로 작동하리라 생각한 기능이 작동하지 않았고

이유는 다음과 같았다.

```jsx
{
        "imports": {
          "three": "https://unpkg.com/three@0.141.0/build/three.module.js",
          "GLTFLoader": "https://unpkg.com/three@0.141.0/examples/jsm/loaders/GLTFLoader.js",
        }
}
```

JS모듈을 불러올때 OrbitControls의 패키지를 가져오지 않아서 생긴 문제였다

three, GLTFLoader만 불러왔고 OrbitControls를 불러오지않아서 생긴문제였고

```jsx
{
        "imports": {
          "three": "https://unpkg.com/three@0.141.0/build/three.module.js",
          "GLTFLoader": "https://unpkg.com/three@0.141.0/examples/jsm/loaders/GLTFLoader.js",
          "OrbitControls": "https://unpkg.com/three@0.142.0/examples/jsm/controls/OrbitControls.js"
        }
}
```

OrbitControls를 불러오니 정상적으로 기능이 작동하였다.

## 소감 및 느낀점

**아쉬운 점** 

- 3일간 진행하였기 때문에 구상 및 기획이 **단단하지 못한 점**

**잘한 점**

- 처음 사용하는 라이브러리를 **최대한 깔끔하고 자연스럽게** 구현
    - 약 3일간 **처음 사용하는 three.js**를 오류없이 작동 및 개발
- 기획이 단단하지 않았지만 **상황에 맞춰 빠르게 진행**한점
    - **UX/UI 구상 및 와이어프레임 구상 없이** 프로젝트 진행
- 부족한 시간이였지만 **시간을 알차게 분배**하여 개발한 점
    - 3일간 **몰입도 있는 개발** 경험
