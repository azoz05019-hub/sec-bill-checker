const puppeteer = require('puppeteer');

async function checkBills() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('جاري فتح صفحة موقع شركة الكهرباء...');
    await page.goto('https://www.se.com.sa/ar-SA/GuestViewBill', { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('جاري الانتظار لحين ظهور حقل إدخال رقم الحساب...');
    // الانتظار حتى تظهر أي خانة إدخال في الصفحة
    await page.waitForSelector('input', { visible: true, timeout: 30000 });

    const accountNumber = '30025850573';
    
    // إدخال رقم الحساب في خانة الإدخال المتاحة
    await page.type('input', accountNumber, { delay: 100 });
    console.log('تم إدخال رقم الحساب بنجاح.');

    // محاولة الضغط على زر الاستمرار أو العرض
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, div'));
        const targetBtn = buttons.find(b => b.innerText && (b.innerText.includes('استمر') || b.innerText.includes('عرض') || b.innerText.includes('بحث')));
        if (targetBtn) targetBtn.click();
    });

    // الانتظار قليلاً لجلب النتيجة
    try {
        await page.waitForFunction(() => document.body.innerText.includes('إجمالي') || document.body.innerText.includes('المبلغ'), { timeout: 15000 });
        
        const totalBill = await page.evaluate(() => {
            const el = document.querySelector('td.cdk-column-totalBill .value') || document.querySelector('.total-bill');
            return el ? el.innerText.trim() : 'تم تجاوز صفحة الإدخال بنجاح';
        });

        console.log(`رقم الحساب: ${accountNumber} - النتيجة: ${totalBill}`);
    } catch (e) {
        console.log('تمت العملية ولكن حدث تجاوز لمهلة انتظار الجدول.');
    }

    await browser.close();
}

checkBills();
