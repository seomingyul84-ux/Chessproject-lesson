// 레슨 문제 데이터 정의
const LESSON_DATA = [
    {
        id: 1,
        // 백랭크 체크메이트 예시 FEN: 흑 차례이지만, 문제에 맞게 백 차례로 가정
        fen: 'r4rk1/1pp2ppp/p1n5/3p4/8/PPPBPN2/1BQP1PPP/R3R1K1 w - - 0 15', 
        solution: 'Qxc6', // 예시 정답 수 (SAN 포맷)
        description: '첫 번째 레슨: **퀸의 희생을 활용한 체크메이트**를 찾아보세요. 백 차례, 1수 만에 흑을 체크메이트 시켜야 합니다.',
        hint: '킹의 탈출로를 막고 있는 룩을 확인하고, 퀸을 제거하는 수를 두어보세요.'
    },
    // 여기에 더 많은 레슨을 추가할 수 있습니다.
];

// 현재 레슨을 설정
let currentLesson = LESSON_DATA[0];
