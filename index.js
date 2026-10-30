const puppeteer = require('puppeteer');

async function checkBills() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // الانتقال لصفحة الكهرباء مع الانتظار حتى تحميل الشبكة بالكامل
    await page.goto('https://www.se.com.sa/ar-SA/GuestViewBill', { waitUntil: 'networkidle2', timeout: 60000 });

    // الانتظار حتى يظهر حقل إدخال رقم الحساب (عبر معرفة الـ input العام في الصفحة)
    await page.waitForSelector('input', { visible: true, timeout: 20000 });

    // إدخال رقم الحساب
    const accountNumber = '30025850573';
    await page.type('input', accountNumber);

    // الضغط على زر "استمر" أو زر البحث (عبر البحث عن زر يحتوي على نص أو عنصر button)
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const targetBtn = buttons.find(b => b.innerText.includes('استمر') || b.innerText.includes('عرض') || b.innerText.includes('بحث'));
        if (targetBtn) targetBtn.click();
    });

    // الانتظار حتى تظهر نتيجة جدول الفاتورة
    try {
        await page.waitForSelector('td.cdk-column-totalBill .value, .totalBill, tr', { timeout: 15000 });
        
        // سحب قيمة إجمالي الفاتورة
        const totalBill = await page.evaluate(() => {
            const el = document.querySelector('td.cdk-column-totalBill .value') || document.querySelector('.totalBill');
            return el ? el.innerText.trim() : 'لم يتم العثور على القيمة المحددة بدقة';
        });

        console.log(`رقم الحساب: ${accountNumber} - إجمالي الفاتورة: ${totalBill}`);
    } catch (e) {
        console.log(`حدث خطأ أثناء انتظار ظهور الجدول للحساب: ${accountNumber}`);
    }

    await browser.close();
}

checkBills();
