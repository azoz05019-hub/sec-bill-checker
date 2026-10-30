const puppeteer = require('puppeteer');

async function checkBills() {
    console.time('وقت التنفيذ الإجمالي');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // فتح الصفحة وتسريع التحميل بتخطي الملفات غير الضرورية
    await page.goto('https://www.se.com.sa/ar-SA/GuestViewBill', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // الانتظار الفوري لحين ظهور حقل الإدخال
    await page.waitForSelector('input', { visible: true, timeout: 15000 });

    const accountNumber = '30025850573';
    await page.type('input', accountNumber, { delay: 50 });

    // النقر على زر البحث مباشرة
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
        const targetBtn = buttons.find(b => b.innerText && (b.innerText.includes('استمر') || b.innerText.includes('عرض') || b.innerText.includes('بحث')));
        if (targetBtn) targetBtn.click();
        else {
            const mainBtn = document.querySelector('button');
            if (mainBtn) mainBtn.click();
        }
    });

    console.log('جاري جلب الفاتورة بذكاء...');

    try {
        // الانتظار الذكي: أول ما تظهر كلمة "ريال" أو أي نتيجة في الصفحة يقرأها فوراً بدون انتظار أوقات ثابتة
        await page.waitForFunction(() => document.body.innerText.includes('ريال') || document.body.innerText.includes('المبلغ'), { timeout: 10000 });
        
        const bodyText = await page.evaluate(() => document.body.innerText);

        console.log(`========================================`);
        console.log(`رقم الحساب: ${accountNumber}`);
        console.log(`تم جلب النتيجة بنجاح!`);
        console.log(bodyText.substring(0, 800)); // عرض المختصر المفيد من النصوص الظاهرة
        console.log(`========================================`);
    } catch (e) {
        console.log('انتهت المهلة، يرجى التحقق.');
    }

    console.timeEnd('وقت التنفيذ الإجمالي');
    await browser.close();
}

checkBills();
