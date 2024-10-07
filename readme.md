# 웹소켓 : 점핑 액션 게임 서버 구현하기

WebSocket을 활용하여 점핑 액션 게임 'Dino Run' 게임 서버를 구현해봅니다.

### 기본 패킷 구조
![기본패킷구조](https://github.com/user-attachments/assets/05db2140-fbe9-49dc-b9d5-1fba08c98864)

## Payload 명세서
### 1. 연결 과정
  - 최초 접속 : 서버가 uuid를 발급 후, 클라는 uuid를 localStorage에 저장
  - 이후 : localStorage에 저장된 uuid를 connect 요청 시, auth에 담아서 보낸다.
  
### 2. 접속 후, 서버 -> 클라
  - 최고기록, 유저의 접속 횟수를 알려준다.
    
    ![최고기록_접속횟수](https://github.com/user-attachments/assets/302e688d-0837-49ad-a00b-e52075974336)
    
  - 이전에 최고기록을 달성했던 적이 있는 경우, 유저의 랭킹 정보를 알려준다.
  ![랭크](https://github.com/user-attachments/assets/ea989b26-fe02-4c48-bbd0-5e96a88e590f)  

  
### 3. 게임 시작
  - 클라 요청
    - **handlerId : 2(gameStart)**
    
  ![시작_클라](https://github.com/user-attachments/assets/a60cb97c-c2c8-4746-8a8a-b8888d3305d9)
  - 서버 -> 클라 응답
    
![시작_서버](https://github.com/user-attachments/assets/6e1b25e3-88b0-4c7d-877d-2713336bb26d)

  

### 4. 게임 종료
  - 플레이어가 장애물인 선인장을 밟을 경우, 게임이 종료된다.
  - 최고기록을 달성할 경우, 접속 중인 모든 유저에게 갱신된 최고기록이 broadcasting 된다.
  - 클라 요청
    - **handlerId : 3(gameEnd)**
      
  ![게임 종료_클라](https://github.com/user-attachments/assets/875e3402-0a03-49e0-bb22-c58609a88289)
  - 서버 응답
    - 서버는 플레이어의 모든 stage의 점수를 합산하여 클라이언트의 점수를 검증한다.

![게임종료_서버](https://github.com/user-attachments/assets/5a8ff92e-ddb2-4acc-8080-f34c455e302d)

### 5. 스테이지 이동
  - 플레이어가 현재 스테이지의 목표 점수에 도달 시, 다음 스테이지로 넘어가기 위해 서버에 요청을 보낸다.
  - 클라 요청
    - **handlerId : 11(moveStageHandler)**

  ![스테이지이동_클라](https://github.com/user-attachments/assets/16ff67ce-0cc9-43c0-930d-4843759e32a0)
    
  - 서버 응답
    - 서버는 플레이어의 해당 stage의 점수를 계산하여 클라이언트의 점수를 검증한다.

  ![스테이지 이동_서버](https://github.com/user-attachments/assets/af46affb-a41b-4d81-a7eb-ec4169bd905e)

### 6. 아이템 획득
  - 플레이어가 포켓볼 아이템을 획득 시, score를 아이템 점수만큼 올리고, 먹은 itemId를 서버에게도 알린다.
  - 클라 요청
    - **handlerId : 12(getItemHandler)**
      
![아이템_클라](https://github.com/user-attachments/assets/ac5c27ec-2c54-45b7-9efa-c1bdce6129ab)

---

## REDIS 연동
### 1. users(String)
- users 폴더로 관리한다.
- key : uuid / value : connectionCount
- 유저 정보에는 접속 횟수가 있다.
### 2. stages(List)
- stages 폴더로 관리한다.
- key : uuid / value : stageInfo
- stageInfo : {score, stageId, date}
- 유저마다 플레이한 기록들을 가지고 있다.
### 3. highScore(Sorted Set)
- key : "highScore" / score : stageScore / member : uuid
- 신기록이 갱신될 때마다 Sorted Set에 저장한다.

※ 접속 시, 클라이언트 특정 문구 출력
1) 몇번째 방문인지 알려준다.
2) 신기록을 달성한 적이 있을 경우, 랭킹 순위와 해당 점수를 알려준다.

---

## 브로드캐스트 테스트
 - 클라이언트는 uuid를 localStorage에 저장하기 때문에
   브로드캐스트 테스트를 **여러 브라우저(chrome, edge)** 환경에서 했습니다.
 
















