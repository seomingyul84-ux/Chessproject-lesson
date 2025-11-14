// main.js 파일 전체 코드 (최종 통합 버전)

// 1. 초기 설정 및 DOM 요소 캐시
var board = null;
var game = new Chess(); 
var $feedbackPanel = $('#feedback-panel');
var $status = $('#feedback-message');
var $lessonDesc = $('#lesson-description');
var $hintText = $('#hint-text');
var $contentPanel = $('#content-panel');

var squareToHighlight = null; 
// ⚠️ 주의: currentLesson과 allLessons는 lessons.js 파일에서 정의/초기화되어야 합니다.
// 예시: let currentLesson = allLessons[0];
var currentStep = null; 
var currentStepIndex = 0; 

// 2. 체스보드 초기화 옵션
var config = {
    draggable: false, 
    position: 'start', 
    onDrop: onDrop,           
    onSnapEnd: onSnapEnd,
    onDragStart: onDragStart,  
    pieceTheme: 'img/{piece}.png',
    
    // 애니메이션 시간을 0ms로 설정 (즉시 이동)
    animationDuration: 0 
};

// =========================================================
// === 3. 이벤트 핸들러 함수 및 유틸리티 ===
// =========================================================

function onDragStart (source, piece, position, orientation) {
    // 퍼즐 모드일 때는 드래그를 막고 클릭으로만 처리
    return false; 
}

// 좌표 추출 함수
function getSquareFromDOM(element) {
    var classList = $(element).attr('class').split(' ');
    for (var i = 0; i < classList.length; i++) {
        var className = classList[i];
        
        if (className.substring(0, 7) === 'square-') {
            var square = className.substring(7); 
            if (square.length === 2 && square.match(/^[a-h][1-8]$/)) { 
                return square; 
            }
        }
    }
    return null; 
}

// highlightSquare 함수: .move-dot만 보이게 수정
function highlightSquare (square, isTarget = false) {
    var $square = $('#board .square-' + square);
    
    if (isTarget) {
        // 이동 가능한 칸에 닷 추가
        var $dot = $square.find('.move-dot');
        if($dot.length === 0) { 
             $square.append('<div class="move-dot"></div>');
        } 
    } 
}

// 닷 즉시 숨김 함수 (선택 해제 시 사용)
function instantHideDots() {
    $('#board .square').removeClass('highlight-target'); 
    $('#board').addClass('hide-highlights'); 
    
    setTimeout(function() {
        $('#board .square .move-dot').remove(); 
        $('#board').removeClass('hide-highlights');
    }, 50); 
}

// 보드 리셋 클린업 함수 (강제 새로고침 - 이동 시 사용)
function resetBoardForCleanup() {
    // 1. 기존 보드 파괴
    if (board) {
        board.destroy();
    }
    // 2. 현재 게임 FEN으로 보드를 즉시 다시 그립니다.
    config.position = game.fen();
    board = Chessboard('board', config);
}


// 칸 클릭을 처리하여 행마를 시도하는 핵심 함수
function handleSquareClick(square) {
    // 1. 현재 선택된 기물이 없음 (새로운 기물 선택 시도)
    if (squareToHighlight === null) {
        instantHideDots();
        
        // ⭐️⭐️⭐️ 좌표 퍼즐 예외 처리 시작 ⭐️⭐️⭐️
        // (기물 선택 전에 처리해야 클릭만으로 정답 판정 가능)
        if (currentStep && currentStep.expectedMove && 
            currentStep.expectedMove.from === currentStep.expectedMove.to) {
            
            const expectedSquare = currentStep.expectedMove.from;

            if (square === expectedSquare) {
                // 정답 칸을 클릭한 경우
                $feedbackPanel.removeClass('feedback-incorrect').addClass('feedback-correct');
                $status.html('정답입니다! 정확히 좌표를 찾았습니다. 다음 단계로 이동 버튼을 눌러주세요.');
                $('#next-step-btn').show(); 
                return;
            } else {
                // 오답 칸을 클릭한 경우
                $feedbackPanel.addClass('feedback-incorrect').removeClass('feedback-correct');
                $status.html(`아닙니다. ${expectedSquare.toUpperCase()} 칸을 찾아보세요.`);
                return;
            }
        }
        // ⭐️⭐️⭐️ 좌표 퍼즐 예외 처리 끝 ⭐️⭐️⭐️
        
        // 기물 선택 로직
        if (game.get(square) && game.get(square).color === game.turn()) {
            squareToHighlight = square;
            
            highlightSquare(square); 
            
            var moves = game.moves({ square: square, verbose: true });
            for (var i = 0; i < moves.length; i++) {
                highlightSquare(moves[i].to, true); // 이동 가능한 칸에 점 찍기
            }
        }
    } 
    
    // 2. 이미 선택된 기물이 있음 (이동 또는 선택 해제 시도)
    else {
        // a) 선택된 기물을 다시 클릭 (선택 해제)
        if (squareToHighlight === square) {
            instantHideDots(); 
            squareToHighlight = null;
            return;
        }

        // b) 이동 시도
        var source = squareToHighlight;
        var target = square;
        
        // 1. 퍼즐 모드인 경우 onDrop 로직 재활용
        if (currentStep && currentStep.expectedMove) {
            
            // from === to 인 좌표 퍼즐은 이미 위에서 처리되었음
            
            const result = onDrop(source, target);
            
            if (result !== 'snapback') {
                // 💡 이동 성공 시:
                board.move(source + '-' + target); 
                squareToHighlight = null; 
                resetBoardForCleanup(); 
            } else {
                board.position(game.fen()); 
            }
            return; 
        }
        
        // 2. 일반 모드 이동
        var move = game.move({ from: source, to: target, promotion: 'q' });

        if (move === null) {
            board.position(game.fen()); 
            
            // 유효하지 않은 이동인 경우, 현재 턴의 기물을 클릭했다면 선택 변경
            if (game.get(square) && game.get(square).color === game.turn()) {
                instantHideDots(); 
                squareToHighlight = null; 
                handleSquareClick(square); // 선택 변경을 위해 재귀 호출
            } 
            return;
        }

        // 3. 유효한 이동인 경우
        board.move(source + '-' + target);
        
        resetBoardForCleanup(); 
        
        squareToHighlight = null; 
        
        $feedbackPanel.removeClass('feedback-correct feedback-incorrect');
        $status.html(`성공적으로 수를 두었습니다: ${move.san}. 다른 행마도 테스트해보세요.`);
    }
}

// 4. 기물 이동 시 (onDrop 함수)
function onDrop (source, target) {
    if (currentStep && currentStep.expectedMove) {
        // 좌표 퍼즐 (from === to)은 여기서 처리되지 않음

        const expected = currentStep.expectedMove;
        
        if (source === expected.from && target === expected.to) {
            const move = game.move({ from: source, to: target, promotion: 'q' }); 
            if (move === null) return 'snapback'; 

            $feedbackPanel.removeClass('feedback-incorrect').addClass('feedback-correct');
            $status.html('정답입니다! 다음 단계로 이동 버튼을 눌러주세요.');
            $('#next-step-btn').show(); 
            
            return 'correct'; 
        } else {
            $feedbackPanel.addClass('feedback-incorrect').removeClass('feedback-correct');
            $status.html('아닙니다. 다른 행마를 시도하여 정답을 찾아보세요.');
            
            return 'snapback'; 
        }
    }

    var move = game.move({ from: source, to: target, promotion: 'q' }); 
    if (move === null) return 'snapback'; 
    
    $feedbackPanel.removeClass('feedback-correct feedback-incorrect');
    $status.html(`성공적으로 수를 두었습니다: ${move.san}. 다른 행마도 테스트해보세요.`);
    return 'success'; 
}


// 5. 다음 단계/레슨 로드 함수
function loadNextStep() {
    currentStepIndex++;
    
    if (currentStepIndex < currentLesson.steps.length) {
        // 현재 레슨의 다음 단계로 이동
        resetBoardForCleanup(); 
        squareToHighlight = null; 
        updateStepContent(); 
    } else {
        // ⭐️ 현재 레슨을 모두 완료하면 다음 레슨으로 이동
        // allLessons 배열이 lessons.js에 정의되어 있어야 함
        if (typeof allLessons === 'undefined' || !Array.isArray(allLessons)) {
             alert('모든 레슨 단계를 완료했습니다. (lessons.js의 allLessons 정의를 확인하세요)');
             return;
        }
        
        const currentLessonIndex = allLessons.findIndex(lesson => lesson.lessonId === currentLesson.lessonId);
        
        if (currentLessonIndex < allLessons.length - 1) {
            // 다음 레슨으로 이동
            currentLesson = allLessons[currentLessonIndex + 1];
            currentStepIndex = 0;
            alert(`${currentLesson.title} 레슨을 시작합니다!`);
            resetBoardForCleanup();
            squareToHighlight = null; 
            updateStepContent();
        } else {
            // 모든 레슨 완료
            alert('모든 레슨을 완료했습니다! 처음으로 돌아갑니다.');
            currentLessonIndex = 0; 
            currentStepIndex = 0;
            currentLesson = allLessons[0];
            updateStepContent();
        }
    }
}

// 6. 힌트 보기 기능
function toggleHint() {
    $hintText.slideToggle();
}

// 7. 기물 스냅백 방지 (보드와 게임 상태 동기화)
function onSnapEnd () {
    board.position(game.fen());
}

// =========================================================
// === 8. 화면 업데이트 (updateStepContent) 함수 ===
// =========================================================

function updateStepContent() {
    // lessons.js에서 정의된 currentLesson 전역 변수를 사용
    if (typeof currentLesson === 'undefined' || !currentLesson.steps) { 
        $status.html("오류: 레슨 데이터를 찾을 수 없거나 형식이 잘못되었습니다.");
        return;
    }
    
    currentStep = currentLesson.steps[currentStepIndex];

    $('.chessboard-area h2').text(`[${currentLesson.title} | ${currentStepIndex + 1}/${currentLesson.steps.length}] ${currentStep.title}`);
    
    $lessonDesc.html(currentStep.description); 
    $hintText.html(currentStep.hint);
    
    resetBoardForCleanup(); 
    squareToHighlight = null; 

    $feedbackPanel.removeClass('feedback-correct feedback-incorrect');
    $hintText.slideUp();
    
    config.position = currentStep.fen;
    
    // 퍼즐(expectedMove)이 있을 때만 클릭으로 이동이 가능하게 설정
    // 좌표 퍼즐 (from === to)도 클릭이 필요하므로 draggable은 false 유지.
    config.draggable = !!currentStep.expectedMove && currentStep.expectedMove.from !== currentStep.expectedMove.to; 
    
    // 기존 보드를 파괴하고 새 보드를 생성
    if (board) {
        board.destroy();
    }
    board = Chessboard('board', config);
    game = new Chess(currentStep.fen); 
    
    $('#next-step-btn').hide(); 
    
    let defaultStatusMessage = '체스보드에서 행마를 테스트하고 다음 단계로 이동하세요.';
    
    if (currentStep.expectedMove) {
        defaultStatusMessage = '정확한 행마를 찾아 정답을 맞혀야 다음 단계로 넘어갈 수 있습니다.';
    } else {
        // 이론 단계에서는 바로 다음 단계로 이동 가능
        $('#next-step-btn').show(); 
    }
    
    $status.html(defaultStatusMessage);

    // 앙파상 시연 로직 (Step ID: '2.2')
    if (currentStep.stepId === '2.2') {
        $('#next-step-btn').hide(); 
        
        setTimeout(function() {
            // ⭐️ 앙파상 셋업 로직: game.move()로 FEN 업데이트 후 board.move()로 시각적 이동
            
            // 1. game.move()를 호출하여 FEN (앙파상 타겟)을 정확히 업데이트합니다.
            const move = game.move('c7c5'); 
            
            if (move) {
                // 2. 시각적 움직임을 위해 board.move()를 호출합니다.
                board.move('c7-c5');
                
                // 3. (안전을 위해) 보드의 최종 상태를 업데이트된 FEN에 맞춥니다.
                board.position(game.fen());
            } else {
                 // FEN이 흑의 턴이 아니거나 c7c5가 불법인 경우
                 console.error("En passant setup move c7c5 failed. Check initial FEN for Step 2.2 - it must be Black's turn and c7c5 must be legal.");
            }

            $status.html('흑이 C7에서 C5로 움직였습니다! 이제 D5 폰으로 앙파상을 시도하세요.');
        }, 1000); 
    }
}


// 9. 초기화 및 이벤트 리스너 설정
$(document).ready(function() {
    
    $('#next-step-btn').on('click', loadNextStep);
    $('#toggle-hint-btn').on('click', toggleHint);
    
    // ⭐️ 오류 검증: allLessons 변수의 존재 유무 및 currentLesson 초기화
    if (typeof allLessons === 'undefined' || !Array.isArray(allLessons)) {
        $('#board').html('<p style="text-align: center; color: red;">체스보드 로드 실패: lessons.js 파일에 문제가 있거나 allLessons 배열이 정의되지 않았습니다.</p>');
        $status.html("오류: 레슨 데이터를 찾을 수 없거나 형식이 잘못되었습니다.");
        return;
    }
    
    // currentLesson이 초기화되어 있지 않으면 allLessons의 첫 번째 레슨으로 설정합니다.
    if (typeof currentLesson === 'undefined' || !currentLesson) {
        currentLesson = allLessons[0];
    }

    updateStepContent(); // 첫 단계 로드
    
    // ⭐️ 최종 안정화: document에 이벤트 위임을 사용하여 클릭이 작동하도록 보장
    $(document).off('click', '#board .square-55d63').on('click', '#board .square-55d63', function() {
        
        var square = getSquareFromDOM(this);

        if (square) {
            handleSquareClick(square);
        } else {
            console.error("Critical Error: Failed to determine square from DOM.");
        }
    });

    $(window).on('resize', function() {
        if(board) board.resize();
    });
});
