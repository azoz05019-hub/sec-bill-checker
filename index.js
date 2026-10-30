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
    
    // إدخال رقم الحساب
    await page.type('input', accountNumber, { delay: 100 });
    console.log('تم إدخال رقم الحساب بنجاح.');

    // النقر على زر "استمر" أو "عرض الفاتورة" بطريقة تفاعلية صحيحة
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
        const targetBtn = buttons.find(b => b.innerText && (b.innerText.includes('استمر') || b.innerText.includes('عرض') || b.innerText.includes('بحث')));
        if (targetBtn) {
            targetBtn.click();
        } else {
            // كخيار بديل إذا لم يجد النص تماماً، يضغط على أول زر رئيسي
            const mainBtn = document.querySelector('button');
            if (mainBtn) mainBtn.click();
        }
    });

    console.log('تم النقر على زر البحث، جاري انتظار تحميل بيانات الفاتورة...');

    // الانتظار لفترة كافية لتحميل بيانات الجدول واشتراط ظهور خانة إجمالي الفاتورة
    try {
        // الانتظار حتى ظهور عنصر المبلغ الإجمالي في الصفحة
        await page.waitForSelector('td.cdk-column-totalBill, .total-bill, span', { timeout: 25000 });
        
        // استخراج القيمة وطباعتها
        const totalBill = await page.evaluate(() => {
            // محاولة البحث عن العنصر المخصص لإجمالي الفاتورة
            const totalEl = document.querySelector('td.cdk-column-totalBill .value') || 
                            document.querySelector('.total-bill') ||
                            document.querySelector('td.cdk-column-totalBill');
            return totalEl ? totalEl.innerText.trim() : 'لم يتم العثور على العنصر المستهدف بدقة';
        });

        console.log(`========================================`);
        console.log(`رقم الحساب: ${accountNumber}`);
        console.log(`إجمالي الفاتورة: ${totalBill}`);
        console.log(`========================================`);
    } catch (e) {
        console.log('انتهت مهلة الانتظار ولم يظهر جدول الفاتورة، يرجى التحقق من صحة رقم الحساب.');
    }

    await browser.close();
}

checkBills();
