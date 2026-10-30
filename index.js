const puppeteer = require('puppeteer');

async function checkBills() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // الانتقال لصفحة الكهرباء
    await page.goto('https://www.se.com.sa/ar-SA/GuestViewBill', { waitUntil: 'networkidle2' });

    // إدخال رقم الحساب (استبدل الرقم برقم حسابك الحقيقي)
    const accountNumber = '30025850573';
    await page.type('input[name="contractAccount"]', accountNumber);

    // الضغط على زر "استمر"
    await page.click('button.button');

    // الانتظار حتى يظهر الجدول وتحمل البيانات
    await page.waitForSelector('td.cdk-column-totalBill .value', { timeout: 15000 });

    // سحب قيمة إجمالي الفاتورة
    const totalBill = await page.$eval('td.cdk-column-totalBill .value', el => el.innerText.trim());
    
    console.log(`رقم الحساب: ${accountNumber} - إجمالي الفاتورة: ${totalBill}`);

    await browser.close();
}

checkBills();