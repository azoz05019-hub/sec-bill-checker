const puppeteer = require('puppeteer');

async function checkBills() {
    console.time('وقت التنفيذ الإجمالي');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // فتح الصفحة
    await page.goto('https://www.se.com.sa/ar-SA/GuestViewBill', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // الانتظار لحين ظهور حقل الإدخال
    await page.waitForSelector('input', { visible: true, timeout: 15000 });

    const accountNumber = '30025850573';
    await page.type('input', accountNumber, { delay: 50 });

    // النقر على زر البحث
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
        const targetBtn = buttons.find(b => b.innerText && (b.innerText.includes('استمر') || b.innerText.includes('عرض') || b.innerText.includes('بحث')));
        if (targetBtn) targetBtn.click();
        else {
            const mainBtn = document.querySelector('button');
            if (mainBtn) mainBtn.click();
        }
    });

    console.log('تم النقر، جاري منح الصفحة 15 ثانية لتكتمل استجابة الخادم...');
    
    // انتظار ثابت كافي جداً لتكتمل استجابة موقع الـ Angular بغض النظر عن الشروط
    await new Promise(resolve => setTimeout(resolve, 15000));

    // سحب كافة النصوص الموجودة في الصفحة وطباعتها لنرى تفاصيل الفاتورة
    const bodyText = await page.evaluate(() => document.body.innerText);

    console.log(`========================================`);
    console.log(`رقم الحساب: ${accountNumber}`);
    console.log(`محتوى الصفحة الفعلي بعد الانتظار:`);
    console.log(bodyText.substring(0, 1200)); // طباعة أول 1200 حرف لرؤية المبلغ أو حالة الفاتورة
    console.log(`========================================`);

    console.timeEnd('وقت التنفيذ الإجمالي');
    await browser.close();
}

checkBills();
