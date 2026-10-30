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
    await page.waitForSelector('input', { visible: true, timeout: 30000 });

    const accountNumber = '30025850573';
    await page.type('input', accountNumber, { delay: 100 });
    console.log('تم إدخال رقم الحساب بنجاح.');

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

    console.log('تم النقر على زر البحث، جاري انتظار تحميل بيانات الفاتورة...');

    try {
        // الانتظار حتى يتغير محتوى الصفحة أو يظهر الجدول
        await new Promise(resolve => setTimeout(resolve, 8000)); // انتظار 8 ثوانٍ لتحميل البيانات بالكامل
        
        // استخراج جميع النصوص المرتبطة بالمبالغ أو الفاتورة
        const pageText = await page.evaluate(() => {
            // جلب أي عناصر تحتوي على ارقام أو مبالغ أو جدول
            const elements = Array.from(document.querySelectorAll('td, span, div, p'));
            return elements
                .map(el => el.innerText ? el.innerText.trim() : '')
                .filter(text => text.includes('ريال') || text.includes('المبلغ') || text.includes('إجمالي') || /^\d+(\.\d+)?$/.test(text));
        });

        console.log(`========================================`);
        console.log(`رقم الحساب: ${accountNumber}`);
        console.log(`النتائج المستخرجة من الصفحة:`, JSON.stringify(pageText.slice(0, 20), null, 2));
        console.log(`========================================`);
    } catch (e) {
        console.log('حدث خطأ أثناء جلب البيانات.');
    }

    await browser.close();
}

checkBills();
