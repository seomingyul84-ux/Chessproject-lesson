// lessons.js 파일 내용 (모든 강조 서식 제거 완료)

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
            
            // 3단계: 폰의 2칸 전진 (예시 2개)
            {
                stepId: '1.1.A.1',
                title: "3단계 (1): 폰 (Pawn, 1점) - 2칸 전진 테스트 (A2)",
                fen: '8/8/8/8/8/8/P7/8 w - - 0 1',
                description: `<p>폰은 처음 움직일 때 1칸 또는 2칸 전진 가능합니다. A2 폰을 움직여 2칸 전진을 시도해 보세요.</p>`,
                hint: 'A2 폰을 A4로 움직여 보세요.',
                expectedMove: { from: 'a2', to: 'a4' }
            },
            {
                stepId: '1.1.A.2',
                title: "3단계 (2): 폰 (Pawn, 1점) - 2칸 전진 테스트 (E2)",
                fen: '8/8/8/8/8/8/4P3/8 w - - 0 1',
                description: `<p>다른 폰으로도 2칸 전진을 연습해 봅시다. E2 폰을 움직여 2칸 전진을 시도해 보세요.</p>`,
                hint: 'E2 폰을 E4로 움직여 보세요.',
                expectedMove: { from: 'e2', to: 'e4' }
            },
            
            // 4단계: 폰의 대각선 잡기 (예시 2개)
            {
                stepId: '1.1.B.1',
                title: "4단계 (1): 폰 (Pawn, 1점) - 대각선 잡기 테스트 (E4 -> D5)",
                fen: '8/8/8/3p4/4P3/8/8/8 w - - 0 1', 
                description: `<p>폰은 앞쪽 대각선에 상대 기물이 있을 때만 잡을 수 있습니다. E4 폰으로 D5 폰을 잡아보세요.</p>`,
                hint: 'e4 폰을 d5로 움직여 흑 폰을 잡습니다. (기보 표기: exd5)',
                expectedMove: { from: 'e4', to: 'd5' }
            },
            {
                stepId: '1.1.B.2',
                title: "4단계 (2): 폰 (Pawn, 1점) - 대각선 잡기 테스트 (F5 -> G6)",
                fen: '8/8/6p1/5P2/8/8/8/8 w - - 0 1', 
                description: `<p>우측 상단에서도 연습해 봅시다. F5 폰으로 G6 폰을 잡아보세요.</p>`,
                hint: 'f5 폰을 g6로 움직여 흑 폰을 잡습니다. (기보 표기: fxg6)',
                expectedMove: { from: 'f5', to: 'g6' }
            },
            
            // 5단계: 폰의 1칸 전진 (규칙 추가됨)
            {
                stepId: '1.1.C',
                title: "5단계: 폰 (Pawn, 1점) - 1칸 전진 테스트",
                fen: '8/8/8/8/4P3/8/8/8 w - - 0 1',
                description: `
                    <p>폰이 이미 한 번 움직여 2칸이 아닌 1칸만 움직인 후에는, 다음부터는 오직 1칸만 전진할 수 있습니다. E4 폰을 1칸 전진시켜 보세요.</p>
                    <p>❗ 주의: 폰이 이미 두 칸 움직인 상태라면, 다음 수부터는 절대 두 칸을 움직일 수 없습니다. 오직 1칸만 전진 가능합니다.</p>
                `,
                hint: 'E4 폰을 E5로 움직이세요.',
                expectedMove: { from: 'e4', to: 'e5' }
            },
            
            // 6단계: 나이트의 행마 (예시 2개)
            {
                stepId: '1.2.1',
                title: "6단계 (1): 나이트 (Knight, N, 3점) - F3으로 이동",
                fen: '8/8/8/8/8/8/3N4/8 w - - 0 1', 
                description: `<p>나이트는 L자 모양으로 움직입니다. D2에 있는 나이트를 F3으로 이동시켜 보세요.</p>`,
                hint: 'D2에서 두 칸 옆, 한 칸 앞으로 이동하세요.',
                expectedMove: { from: 'd2', to: 'f3' }
            },
            {
                stepId: '1.2.2',
                title: "6단계 (2): 나이트 (Knight, N, 3점) - 중앙으로 이동",
                fen: '8/8/8/8/8/8/N7/8 w - - 0 1', 
                description: `<p>나이트는 코너에서 움직임이 제한됩니다. A2에 있는 나이트를 C3으로 이동시켜 중앙으로 나아가세요.</p>`,
                hint: 'A2에서 L자 모양으로 C3까지 가세요.',
                expectedMove: { from: 'a2', to: 'c3' }
            },
            
            // 7단계: 나이트의 기물 잡기
            {
                stepId: '1.2.3',
                title: "7단계: 나이트 (Knight, N, 3점) - 뛰어넘기",
                fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 
                description: `<p>나이트는 L자 모양으로 이동하는 경로에 다른 기물이 있어도 뛰어넘을 수 있습니다. g1 나이트를 f3으로 이동시키 세요.</p>`,
                hint: '나이트는 E4에서 L자로 이동해 D5에 있는 흑 폰을 잡습니다. (기보 표기: Nxd5)',
                expectedMove: { from: 'g1', to: 'f3' }
            },
            
            // 8단계: 비숍의 행마 (예시 2개)
            {
                stepId: '1.3.1',
                title: "8단계 (1): 비숍 (Bishop, B, 3점) - 밝은 칸 대각선 끝까지",
                fen: '8/8/8/8/8/8/8/B7 w - - 0 1', 
                description: `<p>비숍은 대각선으로 움직입니다. A1 (밝은 칸)에 있는 비숍을 보드의 가장 먼 칸인 H8로 이동시켜 보세요.</p>`,
                hint: '가장 긴 밝은 칸 대각선을 따라 이동합니다.',
                expectedMove: { from: 'a1', to: 'h8' }
            },
            {
                stepId: '1.3.2',
                title: "8단계 (2): 비숍 (Bishop, B, 3점) - 어두운 칸 대각선 이동",
                fen: '8/8/8/8/8/8/8/2B5 w - - 0 1', 
                description: `<p>비숍은 평생 자신이 시작한 색깔의 칸에서만 움직입니다. C1 (어두운 칸)에 있는 비숍을 H6으로 이동시켜 보세요.</p>`,
                hint: 'C1에서 우측 위 대각선을 따라 H6으로 가세요.',
                expectedMove: { from: 'c1', to: 'h6' }
            },

            // 9단계: 비숍의 기물 잡기
            {
                stepId: '1.3.3',
                title: "9단계: 비숍 (Bishop, B, 3점) - 기물 잡기",
                fen: '8/8/8/3p4/8/8/2B5/8 w - - 0 1', 
                description: `<p>C2 비숍을 움직여 D5 폰을 잡으세요.</p>`,
                hint: '비숍은 대각선 경로가 막혀 있지 않아야 합니다. C2에서 D5로 가세요. (기보 표기: Bxd5)',
                expectedMove: { from: 'c2', to: 'd5' }
            },

            // 10단계: 룩의 행마 (예시 2개)
            {
                stepId: '1.4.1',
                title: "10단계 (1): 룩 (Rook, R, 5점) - 가로 이동",
                fen: '8/8/8/8/8/8/8/R7 w - - 0 1', 
                description: `<p>룩은 직선(가로/세로)으로 움직입니다. A1에 있는 룩을 H1으로 이동시켜 보세요.</p>`,
                hint: '가로(1랭크)를 따라 끝까지 이동합니다.',
                expectedMove: { from: 'a1', to: 'h1' }
            },
            {
                stepId: '1.4.2',
                title: "10단계 (2): 룩 (Rook, R, 5점) - 세로 이동",
                fen: '8/8/8/8/8/8/8/R7 w - - 0 1', 
                description: `<p>A1에 있는 룩을 세로(A파일)를 따라 가장 먼 칸인 A8로 이동시켜 보세요.</p>`,
                hint: '세로(A파일)를 따라 끝까지 이동합니다.',
                expectedMove: { from: 'a1', to: 'a8' }
            },
            
            // 11단계: 룩의 기물 잡기
            {
                stepId: '1.4.3',
                title: "11단계: 룩 (Rook, R, 5점) - 기물 잡기",
                fen: '8/8/8/3p4/4R3/8/8/8 w - - 0 1', 
                description: `<p>E4 룩을 움직여 D5 폰을 잡으세요.</p>`,
                hint: '룩은 세로로 한 칸 움직여 D5 폰을 잡습니다. (기보 표기: Rxd5)',
                expectedMove: { from: 'e4', to: 'd5' }
            },

            // 12단계: 퀸과 킹의 행마 (이론)
            {
                stepId: '1.5-1.6',
                title: "12단계: 퀸 (Q, 9점) & 킹 (K)",
                fen: '8/8/8/3QK3/8/8/8/8 w - - 0 1', 
                description: `
                    <p>퀸 (Queen, Q, 9점): 룩 + 비숍의 행마법을 모두 가집니다. 즉, 가로, 세로, 대각선으로 원하는 만큼 움직일 수 있습니다. 체스에서 가장 강한 기물입니다.</p>
                    <p>킹 (King, K): 퀸의 행마법을 한 칸씩으로 제한시킨 행마법입니다. 킹이 잡히면 게임이 끝납니다!</p>
                `,
                hint: '퀸은 모든 방향으로 이동 가능하며, 킹은 안전이 최우선입니다.',
            },

            // 13단계: 특수 규칙 1: 프로모션 - 퍼즐
            {
                stepId: '2.1',
                title: "13단계: 특수 규칙 (1) 프로모션 테스트",
                fen: '8/P7/8/8/8/8/8/K7 w - - 0 1', 
                description: `<p>폰이 반대편 끝(8랭크)에 도달하면 승격(프로모션)합니다. A7 폰을 움직여 프로모션을 시도해 보세요. (자동으로 퀸으로 승격됩니다.)</p>`,
                hint: 'A7 폰을 A8로 움직여 퀸으로 바꾸세요.',
                expectedMove: { from: 'a7', to: 'a8' }
            },

            // 14단계: 특수 규칙 2: 앙파상 - 퍼즐
            {
                stepId: '2.2',
                title: "14단계: 특수 규칙 (2) 앙파상 테스트",
                fen: '8/8/8/2pP4/8/8/8/K7 w - c6 0 1', 
                description: `<p>앙파상(En Passant)은 상대 폰이 처음 2칸 전진했을 때, 바로 옆에 있는 내 폰으로 마치 대각선으로 잡는 것처럼 잡을 수 있는 특수 규칙입니다. D5 폰을 움직여 흑색 C5 폰을 잡아보세요.</p>`,
                hint: 'D5 폰을 C6으로 이동시켜 앙파상을 실행하세요.',
                expectedMove: { from: 'd5', to: 'c6' }
            },
            
            // 15단계: 특수 규칙 3: 캐슬링 - 퍼즐 (킹사이드)
            {
                stepId: '2.3.1',
                title: "15단계 (1): 특수 규칙 (3) 캐슬링 테스트 (킹사이드)",
                fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1', // 캐슬링 가능 포지션
                description: `
                    <p>캐슬링은 킹과 룩을 동시에 이동시켜 킹을 안전하게 하는 규칙입니다. 킹을 2칸 이동시키면 룩이 자동으로 넘어옵니다. 흰색 킹을 움직여 킹사이드 (짧은) 캐슬링을 시도해 보세요.</p>
                    <ul>
                        <li>기보 표기: O-O</li>
                    </ul>
                `,
                hint: '킹(E1)을 G1으로 움직이면 룩이 자동으로 F1로 이동합니다.',
                expectedMove: { from: 'e1', to: 'g1' }
            },

            // 16단계: 특수 규칙 3: 캐슬링 - 퍼즐 (퀸사이드)
            {
                stepId: '2.3.2',
                title: "16단계 (2): 특수 규칙 (3) 캐슬링 테스트 (퀸사이드)",
                fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1', // 캐슬링 가능 포지션
                description: `
                    <p>이번에는 반대 방향인 퀸사이드로 캐슬링을 시도해 보세요. 퀸사이드 캐슬링은 더 멀리 이동합니다.</p>
                    <ul>
                        <li>기보 표기: O-O-O</li>
                    </ul>
                `,
                hint: '킹(E1)을 C1으로 움직이면 룩이 자동으로 D1로 이동합니다.',
                expectedMove: { from: 'e1', to: 'c1' }
            },
            
            // 17단계: 용어 정리 (1) - 체크메이트 (퍼즐)
            {
                stepId: '1.0.3.A',
                title: "17단계: 용어 정리 (1) - 체크메이트 테스트",
                fen: 'rnbqkbnr/pppp1ppp/8/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 2', 
                description: `
                    <p>체크메이트 (#): 킹이 잡힐 상황(체크)을 피할 수 없을 때 발생하며, 게임이 즉시 종료됩니다. 흰색 퀸(H5)을 F7 폰이 있는 곳으로 움직여 체크메이트를 시도해보세요. (이 오프닝은 'Fool's Mate'입니다.)</p>
                `,
                hint: '흰색 퀸을 f7로 움직여 킹이 잡힐 수 없는 상태가 되는지 확인하세요. (Qxf7#)',
                expectedMove: { from: 'h5', to: 'f7' }
            },
            
            // 18단계: 용어 정리 (2) - 전략 및 평가 용어 (이론)
            {
                stepId: '1.0.3.B',
                title: "18단계: 용어 정리 (2) - 전략 및 실수",
                fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // 기본 포지션
                description: `
                    <p>블런더 (Blunder): 게임의 결과가 뒤바뀔 정도의 심각한 실수를 뜻합니다. (최악의 수)</p>
                    <p>갬빗 (Gambit): 오프닝에서 주로 폰을 희생하고 더 좋은 포지션이나 빠른 발전을 차지하는 전략입니다. (예: 킹스 갬빗)</p>
                    <p>전술 (Tactics) vs. 전략 (Strategy): 전술은 단기적인 공격이나 수비 시퀀스이며, 전략은 장기적인 계획과 포지션 구축을 뜻합니다.</p>
                    <p>탁월한 수 (Brilliant move): 찾기 어렵지만 최선의 수인 수를 뜻합니다. 보통 기물을 희생하는 수가 탁월한 수로 평가받습니다.</p>
                    <p>미들게임 (Middlegame)과 엔드게임 (Endgame): 미들게임은 오프닝이 끝난 후 (10~15수 이후), 엔드게임은 기물이 별로 남지 않은 체스 게임의 후반부를 뜻합니다.</p>
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
