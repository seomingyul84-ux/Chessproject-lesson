// lessons.js 파일 내용 (최종 수정본: 문법 오류 수정 완료)

const LESSON_DATA = [
    {
        id: 1,
        title: "레슨 1: 체스의 기본 (행마 및 용어)",
        mode: 'theory', 
        
        steps: [
            // 1단계: 기본 세팅 및 좌표 (이론)
            {
                stepId: '1.0.1',
                title: "1단계: 체스보드와 좌표",
                fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                description: `
                    <p>체스는 백(White)이 먼저 시작합니다. 체스보드에서 기물의 위치를 파악하는 좌표(Coordinate)를 확인하세요.</p>
                    <ul>
                        <li>파일 (File): 세로열 (a~h). 백 기준으로 왼쪽에서부터 표기합니다.</li>
                        <li>랭크 (Rank): 가로열 (1~8). 백 기준으로 아래에서부터 표기합니다.</li>
                        <li>좌표 표기는 파일 + 랭크 순서입니다. (예: c6)</li>
                    </ul>
                `,
                hint: '체스보드의 가장 왼쪽 아래 칸은 a1, 가장 오른쪽 위 칸은 h8입니다.',
            },
            // 2단계: 기보 표기 (이론)
            {
                stepId: '1.0.2',
                title: "2단계: 기보 표기 (Algebraic Notation)",
                fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1', 
                description: `
                    <p>게임 행마를 기록하는 기보 표기법을 학습합니다. 기본적으로 (기물 기호) + (이동 위치)로 씁니다.</p>
                    <p>[기물 기호]: K(킹), Q(퀸), R(룩), B(비숍), N(나이트). 폰은 기호를 생략합니다.</p>
                    <ul>
                        <li>예시: f1의 비숍이 e2로 가면 Be2. 폰이 e4로 가면 e4.</li>
                        <li>잡기: 이동한 위치 사이에 'x' 사용 (예: Qxb2).</li>
                    </ul>
                `,
                hint: '체스보드에서 폰을 움직이면 기호 없이 좌표만 기록되는 것을 상상해보세요.',
            },
            
            // 3단계: 폰의 기본 행마 (전진) - 퍼즐
            {
                stepId: '1.1.A',
                title: "3단계: 폰 (Pawn, 1점) - 2칸 전진 테스트",
                fen: '8/8/8/8/8/8/P7/8 w - - 0 1',
                description: `
                    <p>폰은 처음 움직일 때 1칸 또는 2칸 전진 가능합니다. A2 폰을 움직여 2칸 전진을 시도해 보세요.</p>
                `,
                hint: 'A2 폰을 A4로 움직여 보세요.',
                expectedMove: { from: 'a2', to: 'a4' } // 정답 행마
            },
            // 4단계: 폰의 대각선 잡기 - 퍼즐
            {
                stepId: '1.1.B',
                title: "4단계: 폰 (Pawn, 1점) - 대각선 잡기 테스트",
                fen: '8/8/8/3p4/4P3/8/8/8 w - - 0 1', 
                description: `
                    <p>⭐ 폰은 앞쪽 대각선에 상대 기물이 있을 때만 잡을 수 있습니다. E4 폰으로 D5 폰을 잡아보세요.</p>
                `,
                hint: 'e4 폰을 d5로 움직여 흑 폰을 잡을 수 있습니다. (기보 표기: exd5)',
                expectedMove: { from: 'e4', to: 'd5' } // 정답 행마
            },
            // 5단계: 나이트의 행마 - 퍼즐
            {
                stepId: '1.2',
                title: "5단계: 나이트 (Knight, N, 3점) - F2로 이동",
                fen: '8/8/8/8/8/8/3N4/8 w - - 0 1', 
                description: `
                    <p>나이트는 L자 모양으로 움직입니다. D2에 있는 나이트를 F3으로 이동시켜 보세요.</p>
                `,
                hint: 'D2에서 두 칸 옆, 한 칸 앞으로 이동하세요.',
                expectedMove: { from: 'd2', to: 'f3' } // 정답 행마
            },
            // 6단계: 비숍의 행마 - 퍼즐
            {
                stepId: '1.3',
                title: "6단계: 비숍 (Bishop, B, 3점) - G8로 이동",
                fen: '8/8/8/8/8/8/8/B7 w - - 0 1', 
                description: `
                    <p>비숍은 대각선으로 움직입니다. A1에 있는 비숍을 보드의 가장 먼 칸인 H8로 이동시켜 보세요.</p>
                `,
                hint: '가장 긴 대각선을 따라 이동합니다.',
                expectedMove: { from: 'a1', to: 'h8' } // 정답 행마
            },
            // 7단계: 룩의 행마 - 퍼즐
            {
                stepId: '1.4',
                title: "7단계: 룩 (Rook, R, 5점) - H8로 이동",
                fen: '8/8/8/8/8/8/8/R7 w - - 0 1', 
                description: `
                    <p>룩은 직선(가로/세로)으로 움직입니다. A1에 있는 룩을 H1으로 이동시켜 보세요.</p>
                `,
                hint: '가로(랭크)를 따라 끝까지 이동합니다.',
                expectedMove: { from: 'a1', to: 'h1' } // 정답 행마
            },
            // 8단계: 퀸과 킹의 행마 (이론)
            {
                stepId: '1.5-1.6',
                title: "8단계: 퀸 (Q, 9점) & 킹 (K)",
                fen: '8/8/8/3QK3/8/8/8/8 w - - 0 1', 
                description: `
                    <p>퀸: 룩 + 비숍의 행마법을 모두 가집니다. 퀸은 체스에서 가장 강한 기물이기도 합니다. (메이저 피스)</p>
                    <p>킹: 퀸의 행마법을 한 칸씩으로 제한시킨 행마법입니다. 킹은 잡히면 안 됩니다!</p>
                `,
                hint: '퀸이 룩과 비숍의 움직임을 모두 합친 것임을 확인해보세요.',
            },
            // 9단계: 특수 규칙 1: 프로모션 - 퍼즐
            {
                stepId: '2.1',
                title: "9단계: 특수 규칙 (1) 프로모션 테스트",
                fen: '8/P7/8/8/8/8/8/K7 w - - 0 1', 
                description: `
                    <p>폰이 반대편 끝(8랭크)에 도달하면 승격(프로모션)합니다. A7 폰을 움직여 프로모션을 시도해 보세요.</p>
                `,
                hint: 'A7 폰을 A8로 움직이면 자동으로 퀸으로 승격됩니다.',
                expectedMove: { from: 'a7', to: 'a8' } // 정답 행마 (퀸 프로모션)
            },
            // 10단계: 특수 규칙 2: 앙파상 - 퍼즐
            {
                stepId: '2.2',
                title: "10단계: 특수 규칙 (2) 앙파상 테스트",
                fen: '8/8/8/2pP4/8/8/8/K7 w - c6 0 1', 
                description: `
                    <p>앙파상은 상대 폰이 2칸 전진했을 때만 가능합니다. D5 폰을 움직여 흑색 C5 폰을 잡아보세요.</p>
                `,
                hint: 'D5 폰을 C6으로 이동시켜 보세요.',
                expectedMove: { from: 'd5', to: 'c6' } // 정답 행마
            },
            // 11단계: 특수 규칙 3: 캐슬링 - 퍼즐
            {
                stepId: '2.3',
                title: "11단계: 특수 규칙 (3) 캐슬링 테스트",
                fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1', // 캐슬링 가능 포지션
                description: `
                    <p>캐슬링은 킹과 룩을 동시에 이동시켜 킹을 안전하게 하는 규칙입니다. 흰색 킹을 움직여 킹사이드 캐슬링을 시도해 보세요.</p>
                    <ul>
                        <li>킹사이드 캐슬링: O-O</li>
                    </ul>
                `,
                hint: '킹(E1)을 G1으로 움직이면 룩이 자동으로 F1로 이동합니다.',
                expectedMove: { from: 'e1', to: 'g1' } // 정답 행마
            },
            // 12단계: 용어 정리 (1) - 체크 및 스테일메이트 (퍼즐)
            {
                stepId: '1.0.3.A',
                // !! 여기를 수정했습니다: 닫는 큰따옴표와 쉼표 추가 !!
                title: "12단계: 용어 정리 (1) - 체크메이트 테스트", 
                fen: 'rnbqkbnr/pppp1ppp/8/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 2', 
                description: `
                    <p>⭐ 체크메이트는 킹이 잡힐 상황을 피할 수 없을 때 발생하며, 게임이 즉시 종료됩니다. 흰색 퀸(H5)을 F7 폰이 있는 곳으로 움직여 체크메이트를 시도해보세요.</p>
                `,
                hint: '흰색 퀸을 f7로 움직여 킹이 잡힐 수 없는 상태가 되는지 확인하세요. (Qxf7#)',
                expectedMove: { from: 'h5', to: 'f7' } // 정답 행마
            },
            // 13단계: 용어 정리 (2) - 전략 및 평가 용어 (이론)
            {
                stepId: '1.0.3.B',
                title: "13단계: 용어 정리 (2) - 전략 및 실수",
                fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // 기본 포지션
                description: `
                    <p>⭐ 블런더 (Blunder): 게임의 결과가 뒤바뀔 정도의 심각한 실수를 뜻합니다.</p>
                    <p>⭐ 갬빗 (Gambit): 오프닝에서 주로 폰을 희생하고 더 좋은 포지션을 차지하는 전략입니다. (예: 킹스 갬빗)</p>
                    <p>⭐ 전술 (Tactics) vs. 전략 (Strategy): 전술은 단기적인 공격, 전략은 장기적인 계획을 뜻합니다.</p>
                    <p>⭐ 탁월한 수 (Brilliant move): 찾기 어렵지만 최선의 수인 수를 뜻합니다. 보통 기물을 희생하는 수가 탁월한 수로 평가받습니다.</p>
                    <p>⭐ 미들게임과 엔드게임 (Middlegame,endgame): 미들게임은 오프닝이 끝난 후,보통 게임을 시작한 지 10수 이후를 뜻하며, 엔드게임은 기물이 별로 남지 않은 체스 게임의 후반부를 뜻합니다.</p>
                `,
                hint: '전술(단기)과 전략(장기)의 차이를 기억하세요.',
            }
        ]
    }
];

// 현재 레슨 상태 추적 변수 (main.js와 연결)
let currentLessonIndex = 0; 
let currentStepIndex = 0;   
let currentLesson = LESSON_DATA[currentLessonIndex];
let currentStep = currentLesson.steps[currentStepIndex];
