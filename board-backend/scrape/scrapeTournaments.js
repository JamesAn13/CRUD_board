// 필요한 모듈들을 가져옵니다.
import { chromium } from "playwright"; // Playwright의 chromium 모듈
import db from '../db.js'; // 데이터베이스 연결 설정

// --- 날짜 파싱 헬퍼 함수 ---
// 날짜 텍스트(예: "07 - 12 JAN" 또는 "25 FEB - 02 MAR")와 연도를 입력받아 시작일과 종료일을 YYYY-MM-DD 형식으로 반환합니다.
function parseDates(dateText, year) {
  // 'undefined'와 같은 유효하지 않은 텍스트를 처리합니다.
  if (!dateText || !dateText.includes(' - ')) {
    return [null, null];
  }

  // 월 이름(대문자)과 월 번호를 매핑합니다.
  const monthMap = {
    JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
    JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12'
  };

  try {
    // 날짜 텍스트를 시작 부분과 끝 부분으로 나누고 공백을 제거합니다.
    const [startPart, endPart] = dateText.split(' - ').map(s => s.trim());

    let startDay, startMonthStr, endDay, endMonthStr;
    let startDate, endDate;

    const startPartSplit = startPart.split(' ');
    const endPartSplit = endPart.split(' ');

    if (startPartSplit.length === 1 && endPartSplit.length === 2) {
      // 형식: "07 - 12 JAN"
      startDay = startPartSplit[0];
      endDay = endPartSplit[0];
      endMonthStr = endPartSplit[1].toUpperCase();
      startMonthStr = endMonthStr; // 월이 같음
    } else if (startPartSplit.length === 2 && endPartSplit.length === 2) {
      // 형식: "25 FEB - 02 MAR"
      startDay = startPartSplit[0];
      startMonthStr = startPartSplit[1].toUpperCase();
      endDay = endPartSplit[0];
      endMonthStr = endPartSplit[1].toUpperCase();
    } else {
      // 알 수 없는 형식
      console.error('알 수 없는 날짜 형식:', dateText);
      return [null, null];
    }

    const startMonth = monthMap[startMonthStr];
    const endMonth = monthMap[endMonthStr];

    if (!startMonth || !endMonth) {
      console.error('월을 매핑할 수 없습니다:', dateText);
      return [null, null];
    }
    
    // "25 DEC - 02 JAN"과 같이 연도가 바뀌는 경우를 처리합니다.
    let endYear = year;
    if (parseInt(startMonth, 10) > parseInt(endMonth, 10)) {
        endYear = year + 1;
    }

    startDate = `${year}-${startMonth}-${startDay.padStart(2, '0')}`;
    endDate = `${endYear}-${endMonth}-${endDay.padStart(2, '0')}`;

    // 날짜 유효성을 검사합니다.
    if (isNaN(new Date(startDate)) || isNaN(new Date(endDate))) {
      console.error('유효하지 않은 날짜가 생성되었습니다:', { startDate, endDate });
      return [null, null];
    }

    return [startDate, endDate];
  } catch (error) {
    console.error('날짜 파싱 오류:', dateText, error);
    return [null, null];
  }
}


// --- 스크래핑 및 데이터 저장 메인 함수 ---
async function scrapeAndSave() {
  console.log("스크래핑 프로세스를 시작합니다...");
  // Chromium 브라우저를 실행합니다. headless: false는 브라우저 UI를 보여줍니다.
  const browser = await chromium.launch({ headless: false }); 
  const page = await browser.newPage(); // 새 페이지를 엽니다.
  // 지정된 URL로 이동하고 네트워크가 안정될 때까지 기다립니다.
  await page.goto("https://bwfbadminton.com/calendar", { waitUntil: "networkidle" });

  // --- 무한 스크롤 로직 (더 느리고 안정적으로) ---
  let previousHeight = -1;
  let scrollAttempts = 0;
  const maxScrollAttempts = 50; // 무한 루프 방지를 위한 최대 시도 횟수

  while (scrollAttempts < maxScrollAttempts) {
    const currentHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log(`Previous height: ${previousHeight}, Current height: ${currentHeight}`);

    if (currentHeight === previousHeight) {
      console.log("Page height hasn\'t changed. Reached the bottom.");
      break; // 페이지 맨 아래에 도달하면 반복을 멈춥니다.
    }
    previousHeight = currentHeight;
    
    console.log("Scrolling down slowly...");
    // 페이지를 천천히 끝까지 스크롤합니다.
    await page.evaluate(async () => {
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
      for (let i = 0; i < document.body.scrollHeight; i += 100) {
        window.scrollTo(0, i);
        await delay(100); // 100ms 마다 100픽셀씩 스크롤
      }
    });

    // 새 콘텐츠가 로드될 시간을 충분히 줍니다.
    console.log("Waiting for new content to load...");
    await page.waitForTimeout(3000); // 3초 대기

    scrollAttempts++;
    if(scrollAttempts === maxScrollAttempts){
      console.log("Max scroll attempts reached. Stopping scroll.");
    }
  }
  console.log("스크롤이 완료되었습니다.");

  // --- 데이터 추출 로직 ---
  const scrapedData = await page.evaluate(() => {
    // 모든 토너먼트 카드 요소를 선택합니다.
    const tournamentCards = document.querySelectorAll(".tmt-card");
    const data = [];
    tournamentCards.forEach(card => {
      // 토너먼트 이름을 가져옵니다.
      const name = card.querySelector(".tmt-details .text-info > span")?.innerText.trim();
      if (name) { // 이름이 있는 경우에만 데이터를 추출합니다.
        const location = card.querySelector(".tmt-details .text-info .country")?.innerText.trim(); // 장소
        const series = card.querySelector(".label-category")?.innerText.trim(); // 시리즈
        const prize = card.querySelector(".prize-money")?.innerText.trim(); // 상금
        const dateText = card.querySelector(".date > span")?.innerText.trim(); // 날짜 텍스트
        const logo = card.querySelector(".logo-wrapper img")?.src; // 로고 이미지 URL
        data.push({ name, location, series, prize, dateText, logo });
      }
    });
    return data;
  });
  console.log(`성공적으로 ${scrapedData.length}개의 토너먼트를 스크랩했습니다.`);

  await browser.close(); // 브라우저를 닫습니다.

  // --- 데이터베이스 삽입 로직 ---
  if (scrapedData.length === 0) {
    console.log("데이터베이스에 저장할 데이터가 없습니다.");
    return;
  }

  console.log("데이터베이스 삽입을 시작합니다...");
  const currentYear = new Date().getFullYear(); // 현재 연도
  let insertedCount = 0; // 삽입된 데이터 수
  let updatedCount = 0; // 업데이트된 데이터 수

  for (const item of scrapedData) {
    // 날짜 텍스트를 파싱하여 시작일과 종료일을 얻습니다.
    const [startDate, endDate] = parseDates(item.dateText, currentYear);

    // 데이터베이스에 저장할 토너먼트 데이터 객체를 만듭니다.
    const tournamentData = {
      name: item.name,
      series: item.series,
      prize: item.prize,
      location: item.location,
      start_date: startDate,
      end_date: endDate,
      logo_url: item.logo,
    };

    try {
      // 같은 이름의 토너먼트가 이미 존재하는지 확인합니다.
      const [existing] = await db.query('SELECT id FROM tournaments WHERE name = ?', [tournamentData.name]);

      if (existing.length > 0) {
        // 존재하면, 해당 데이터를 업데이트합니다.
        await db.query('UPDATE tournaments SET ? WHERE id = ?', [tournamentData, existing[0].id]);
        updatedCount++;
      } else {
        // 존재하지 않으면, 새 데이터로 삽입합니다.
        await db.query('INSERT INTO tournaments SET ?', tournamentData);
        insertedCount++;

        console.log(`새 토너먼트가 추가되었습니다: ${tournamentData.name}`);

        // 모든 사용자 ID를 가져옵니다.
        const [users] = await db.query('SELECT id FROM users');
        const notificationMessage = `새로운 토너먼트가 추가되었습니다: ${tournamentData.name}`;
        const notificationLink = `/tournaments`; // 알림 클릭 시 이동할 링크

        // 각 사용자에게 알림을 보냅니다.
        for (const user of users) {
          await db.query(
            'INSERT INTO notifications (user_id, type, message, link) VALUES (?, ?, ?, ?)',
            [user.id, 'new_tournament', notificationMessage, notificationLink]
          );
        }
      }
    } catch (error) {
      console.error(`"${item.name}" 토너먼트 저장 실패:`, error);
    }
  }
  console.log(`데이터베이스 작업 완료. 삽입: ${insertedCount}, 업데이트: ${updatedCount}.`);
}

// --- 스크립트 실행 ---
scrapeAndSave().then(() => {
  console.log("스크립트가 성공적으로 완료되었습니다.");
  db.end(); // 데이터베이스 연결을 닫습니다.
}).catch(error => {
  console.error("스크립트 실행 중 오류가 발생했습니다:", error);
  db.end(); // 오류 발생 시에도 연결을 닫습니다.
});

// 이 스크립트는 자체적으로 실행되므로 기본 내보내기를 제거합니다.