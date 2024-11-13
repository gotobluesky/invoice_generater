// const base_url = 'https://budgetingtool.com.au';
const base_url = 'http://localhost';

let bills = JSON.parse(localStorage.getItem('bills')) || [];
let payFrequency = localStorage.getItem('payFrequency') || '';
let income = parseFloat(localStorage.getItem('income')) || 0;
let payday = localStorage.getItem('payday') || '';
let viewMode = localStorage.getItem('viewMode') || 'payCycle';
let darkMode = localStorage.getItem('darkMode') === 'true';
let generatedPayCycles = 30;
let revealedPayCycles = 12;
let tags = JSON.parse(localStorage.getItem('tags')) || ['default'];
let oneOffIncomes = JSON.parse(localStorage.getItem('oneOffIncomes')) || [];
let sortType = JSON.parse(localStorage.getItem("sortOrder")) || { name: "desc" };
let selectedTag = localStorage.getItem("table_datatype") || "all";
let billList = [];
let billList1 = [];
let saveList = [];
let saveList1 = [];
let dateList1 = [];
let updateList = [];

console.log(window.location.pathname);
if (window.location.pathname == "/") {
    // if (window.location.pathname == "/Budgeting-tool-5/") {
    if (window.innerWidth < 770) {
        window.location.href = base_url + "/mobile/index.html";
    } else {
        window.location.href = base_url + "/pc/index.html";
    }
}


window.addEventListener('resize', function () {
    if (window.innerWidth < 770) {
        window.location.href = base_url + "/mobile/index.html";
    } else {
        window.location.href = base_url + "/pc/index.html";
    }
});

if (!localStorage.payday) {
    $("#incomeModal").show();
} else {

    if (document.getElementById("existingTag")) {
        let tagList = maketahlist();
        tagList.forEach((tag, index) => {
            document.getElementById('existingTag').innerHTML += `
            <option value="${tag}">${tag}</option>
        `
        })
    }
    if (document.getElementById("tagFilter")) {
        let tagList = maketahlist();
        tagList.forEach((tag, index) => {
            document.getElementById('tagFilter').innerHTML += `
            <option value="${tag}">${tag}</option>
        `
        })
    }
    let nextDate = new Date(payday);
    let currentDate = new Date();
    if (nextDate < currentDate) {
        while (nextDate < currentDate) {
            switch (localStorage.payFrequency) {
                case 'weekly':
                    nextDate.setDate(nextDate.getDate() + 7);
                    break;
                case 'fortnightly':
                    nextDate.setDate(nextDate.getDate() + 14);
                    break;
                case 'monthly':
                    nextDate.setMonth(nextDate.getMonth() + 1);
                    break;

                default:
                    throw new Error(`Unsupported frequency: ${frequency}`);
            }
        }
        if (nextDate > currentDate) {
            switch (localStorage.payFrequency) {
                case 'weekly':
                    nextDate.setDate(nextDate.getDate() - 7);
                    break;
                case 'fortnightly':
                    nextDate.setDate(nextDate.getDate() - 14);
                    break;
                case 'monthly':
                    nextDate.setMonth(nextDate.getMonth() - 1);
                    break;

                default:
                    throw new Error(`Unsupported frequency: ${payFrequency}`);
            }
        }
    }
    payday = nextDate;
    localStorage.setItem("payday", nextDate);
    maindatashow();
    saveToLocalStorage();
    if (document.getElementById('tagFilter')) {
        document.getElementById('tagFilter').value = localStorage.table_datatype || "all";
    }
}

function createincome() {
    let incomeAmount = document.getElementById('IncomeAmount').value;
    let incomeFrequency = document.getElementById('editFrequency').value;
    let incomePayday = document.getElementById('editPayday').value;
    if (incomePayday == "") {
    } else {
        payFrequency = incomeFrequency;
        income = incomeAmount;
        payday = incomePayday;
        $("#incomeModal").hide();
        saveToLocalStorage();
        location.reload();
    }
}

function updateIncomeDate() {

    let incomeAmount = document.getElementById('IncomeAmount2').value;
    let incomeFrequency = document.getElementById('editFrequency2').value;
    let incomePayday = document.getElementById('editPayday2').value;
    if (incomePayday == "") {
    } else {
        payFrequency = incomeFrequency;
        income = incomeAmount;
        payday = incomePayday;
        $("#incomeModal2").hide();
        saveToLocalStorage();
        location.reload();
    }
}

function saveToLocalStorage() {
    console.log(bills);
    
    localStorage.setItem('bills', JSON.stringify(bills));
    localStorage.setItem('payFrequency', payFrequency);
    localStorage.setItem('income', income.toString());
    localStorage.setItem('payday', payday);
    localStorage.setItem('viewMode', viewMode);
    localStorage.setItem('darkMode', darkMode);
    localStorage.setItem('tags', JSON.stringify(tags));
    localStorage.setItem('oneOffIncomes', JSON.stringify(oneOffIncomes));
}

function maindatashow() {
    yearamountcalculate();
    if (viewMode == "payCycle") {
        makeList();
    } else {
        makeList_monthly();
    }
}

function yearamountcalculate() {
    let yearIncome;
    let yearBillAmoun = 0;
    let yearSaveAmount = 0;
    let totalamount = 0;
    if (document.getElementById('incomeAmount') != null) {
        document.getElementById('incomeAmount').textContent = `$${income.toFixed(2)}`;
    }

    if (document.getElementById('incomeFrequency') != null) {
        document.getElementById('incomeFrequency').textContent = payFrequency;
    }
    yearIncome = calculate(income, payFrequency);

    oneOffIncomes.forEach(save => {
        yearSaveAmount += calculate(save.amount, "one-off");
    });
    yearIncome = yearIncome + yearSaveAmount;
    if (document.getElementById('yearlyIncomeAmount') != null) {
        document.getElementById('yearlyIncomeAmount').textContent = `$${yearIncome.toFixed(2)}`;
    }
    bills.forEach(bill => {
        yearBillAmoun += calculate(bill.amount, bill.frequency);
    });

    if (document.getElementById('yearlyBillsAmount') != null) {
        document.getElementById('yearlyBillsAmount').textContent = `-$${yearBillAmoun.toFixed(2)}`;
    }
    totalamount = yearIncome - yearBillAmoun;
    if (document.getElementById('yearlySavingsAmount') != null) {
        if (totalamount < 0) {
            document.getElementById('yearlySavingsAmount').innerHTML = `danger
                <span id="yearlySavingsAmount" class="price-data price-danger">$ ${totalamount.toFixed(2)}</span>
            `;
        } else {
            document.getElementById('yearlySavingsAmount').innerHTML = `
                <span id="yearlySavingsAmount" class="price-data price-success">$ ${totalamount.toFixed(2)}</span>
            `;
        }
    }

    if (document.getElementById('myChart')) {
        update_ct_data(totalamount / yearIncome, yearBillAmoun / yearIncome);
        const billsamount = yearBillAmoun / yearIncome * 100;
        const savingsAmount = totalamount / yearIncome * 100;
        document.getElementById('bills_dt').textContent = billsamount.toFixed(2);
        document.getElementById('savings_dt').textContent = savingsAmount.toFixed(2);
    }

}

function calculate(amount, Frequency) {
    let yrearAmount;
    switch (Frequency) {
        case 'weekly':
            yrearAmount = amount * 52;
            break;
        case 'fortnightly':
            yrearAmount = amount * 26;
            break;
        case 'monthly':
            yrearAmount = amount * 12;
            break;
        case 'quarterly':
            yrearAmount = amount * 4;
            break;
        case 'yearly':
            yrearAmount = amount * 1;
            break;
        case 'one-off':
            yrearAmount = amount * 1;
            break;

        default:
            throw new Error(`Unsupported frequency: ${Frequency}`);
    }
    return yrearAmount;
}

function makeList() {
    let startdate = payday;
    saveList = []
    let nextDate = new Date(startdate);
    for (let i = 0; i < 12; i++) {
        let day = makeStringdate(nextDate);
        switch (localStorage.payFrequency) {
            case 'weekly':
                dateList1[i] = day;
                saveList[i] = makeSaveList(nextDate, "weekly");

                billList[i] = makebillList(nextDate, "weekly");
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'fortnightly':
                dateList1[i] = day;
                saveList[i] = makeSaveList(nextDate, "fortnightly");
                billList[i] = makebillList(nextDate, "fortnightly");
                nextDate.setDate(nextDate.getDate() + 14);
                break;
            case 'monthly':
                dateList1[i] = day;
                saveList[i] = makeSaveList(nextDate, "monthly");
                billList[i] = makebillList(nextDate, "monthly");
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            default:
                throw new Error(`Unsupported frequency: ${frequency}`);
        }

    }

    update_chat(dateList1);
    update_BillsTable();
}

function makebillList(date, Frequency) {
    let startdate = date;
    let enddate = new Date(startdate);
    let amount = 0;
    let billList = [];
    let bill_Listdata = {};
    let cnt = 0;
    switch (Frequency) {
        case 'weekly':
            enddate.setDate(startdate.getDate() + 7);
            break;
        case 'fortnightly':
            enddate.setDate(startdate.getDate() + 14);
            break;
        case 'monthly':
            enddate.setMonth(startdate.getMonth() + 1);
            break;
        default:
            throw new Error(`Unsupported frequency: ${frequency}`);
    }
    bills.forEach(bill => {
        let date = new Date(bill.date);
        let nextDate = date;
        while (nextDate <= enddate) {
            switch (bill.frequency) {
                case 'weekly':
                    if (nextDate >= startdate && enddate >= nextDate) {
                        amount = amount + bill.amount;
                        cnt++;
                        let date = makeStringdate(nextDate);
                        billList[cnt] = {
                            amount: bill.amount,
                            name: bill.name,
                            date: date
                        }
                    }
                    nextDate.setDate(nextDate.getDate() + 7);
                    break;
                case 'fortnightly':
                    if (nextDate >= startdate && enddate >= nextDate) {
                        amount = amount + bill.amount;
                        cnt++;
                        let date = makeStringdate(nextDate);
                        billList[cnt] = {
                            amount: bill.amount,
                            name: bill.name,
                            date: date
                        }
                    }
                    nextDate.setDate(nextDate.getDate() + 14);
                    break;
                case 'monthly':
                    if (nextDate >= startdate && enddate >= nextDate) {
                        amount = amount + bill.amount;
                        cnt++;
                        let date = makeStringdate(nextDate);
                        billList[cnt] = {
                            amount: bill.amount,
                            name: bill.name,
                            date: date
                        }
                    }
                    nextDate.setMonth(nextDate.getMonth() + 1);
                    break;
                case 'quarterly':
                    if (nextDate >= startdate && enddate >= nextDate) {
                        amount = amount + bill.amount;
                        cnt++;
                        let date = makeStringdate(nextDate);
                        billList[cnt] = {
                            amount: bill.amount,
                            name: bill.name,
                            date: date
                        }
                    }
                    nextDate.setMonth(nextDate.getMonth() + 3);
                    break;
                case 'yearly':
                    if (nextDate >= startdate && enddate >= nextDate) {
                        amount = amount + bill.amount;
                        cnt++;
                        let date = makeStringdate(nextDate);
                        billList[cnt] = {
                            amount: bill.amount,
                            name: bill.name,
                            date: date
                        }
                    }
                    nextDate.setMonth(nextDate.getMonth() + 13);
                    break;
                case 'one-off':
                    if (nextDate >= startdate && enddate >= nextDate) {
                        amount = amount + bill.amount;
                        cnt++;
                        let date = makeStringdate(nextDate);
                        billList[cnt] = {
                            amount: bill.amount,
                            name: bill.name,
                            date: date
                        }
                    }
                    nextDate.setMonth(nextDate.getMonth() + 13);
                    break;
                default:
                    throw new Error(`Unsupported frequency: ${frequency}`);
            }
        }
    })
    bill_Listdata.amount = amount;
    bill_Listdata.bill_List = billList;
    return bill_Listdata;
}

function makeSaveList(date, Frequency) {
    let startdate = date;
    let enddate = new Date(startdate);
    let amount = localStorage.income;
    let save_List = [];
    let saveList_data = {};
    let cnt = 0;
    switch (Frequency) {
        case 'weekly':
            enddate.setDate(startdate.getDate() + 7);
            break;
        case 'fortnightly':
            enddate.setDate(startdate.getDate() + 14);
            break;
        case 'monthly':
            enddate.setMonth(startdate.getMonth() + 1);
            break;
        default:
            throw new Error(`Unsupported frequency: ${frequency}`);
    }

    oneOffIncomes.forEach(save => {
        let date = new Date(save.date);
        if (date >= startdate && date < enddate) {
            cnt++;
            let savedate = makeStringdate(date);
            amount = Number(amount) + Number(save.amount);
            save_List[cnt] = {
                amount: save.amount,
                name: save.name,
                date: savedate,
                tag: "income",
                frequency: "one-off",
            }
        }
    })
    saveList_data.amount = Number(amount);
    saveList_data.saveList = save_List;
    return saveList_data;
}

function update_chat(updateDatalist) {
    for (let i = 0; i < 12; i++) {
        saveList1[i] = saveList[i].amount - billList[i].amount;
    }
    for (let i = 0; i < 12; i++) {
        billList1[i] = -billList[i].amount;
        if (saveList[i].amount - billList[i].amount < 0) {
            billList1[i] = -billList[i].amount - saveList1[i];
        }
    }
    if (document.getElementById('financialChart')) {
        const canvas = document.getElementById('financialChart');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (window.financialChart && typeof window.financialChart.destroy === 'function') {
            window.financialChart.destroy();
        }
        let formDateList = [];
        for (let i = 0; i < updateDatalist.length; i++) {
            let date = new Date(updateDatalist[i])
            formDateList[i] = formatDate(date);
        }

        window.financialChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: updateDatalist,
                datasets: [

                    {
                        label: 'Leftover',
                        data: saveList1,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderRadius: 10,
                        stack: 'Stack 0',
                    },
                    {
                        label: 'Total Bills',
                        data: billList1,
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        borderRadius: 10,
                        stack: 'Stack 0',
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        stacked: true,
                        beginAtZero: true,
                        type: 'category',
                        labels: formDateList,
                        ticks: { autoSkip: true, maxTicksLimit: 20 },
                        title: { display: false },
                        grid: {
                            display: false,
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        grid: {
                            display: false,
                        },
                        ticks: {
                            callback: function (value) {
                                if (value >= 1000) {
                                    return value / 1000 + 'k';
                                }
                                return value;
                            }
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true }
                }
            }
        });
    }
}

function updatebillList(updateDatalist) {

    if (document.getElementById('accordionContainer') != null) {
        const accordionContainer = document.getElementById('accordionContainer');
        for (let i = 0; i < 12; i++) {
            let sum = saveList[i].amount - billList[i].amount;
            let classname = "positive";
            if (sum < 0) {
                classname = "negative";
            }
            let table = ``;

            let updatedateList = billList[i].bill_List.concat(saveList[i].saveList);
            updatedateList.forEach((bill, index) => {
                bill.date = new Date(bill.date);
            })
            updatedateList.sort(function (a, b) {
                let x = a.date;
                let y = b.date;
                if (x < y) { return -1; }
                if (x > y) { return 1; }
                return 0;
            });
            updatedateList.forEach((bill, index) => {
                let date = makeStringdate(bill.date);
                bill.date = date;
            })
            if (viewMode == "payCycle") {
                let Incomedate = { amount: income, name: "Income", date: dateList1[i], tag: "income", frequency: "one-off" }
                updatedateList.unshift(Incomedate);
            }
            updatedateList.forEach((bill, index) => {
                let date = new Date(bill.date);
                table = table + `
                 <tr>
                    <td>${bill.name}</td>
                    <td >
                        ${formatDate(date)}
                    </td>
                    <td class="right-align ${bill.tag != "income" ? ' bills negative">-$' : ' positive">$'}${bill.amount}</td>
                 </tr>`
            })

            let isOpen;
            let panelStyle;
            let toggleText;
            if (bills_table_status(i)) {
                isOpen = bills_table_status(i);
                panelStyle = isOpen == "true" ? 'block' : 'none';
                toggleText = isOpen == "false" ? 'Show' : 'Hide';
            } else {
                toggleText = "Show";
                panelStyle = "none";
            }
            let newstartdate = new Date(updateDatalist[i]);
            let newenddate = new Date(newstartdate);

            if (viewMode == "monthly") {
                newenddate.setMonth(newstartdate.getMonth() + 1);
            } else {
                switch (payFrequency) {
                    case 'weekly':
                        newenddate.setDate(newstartdate.getDate() + 7);
                        break;
                    case 'fortnightly':
                        newenddate.setDate(newstartdate.getDate() + 14);
                        break;
                    case 'monthly':
                        newenddate.setMonth(newstartdate.getMonth() + 1);
                        break;
                    case 'quarterly':
                        newenddate.setMonth(newstartdate.getMonth() + 3);
                        break;
                    case 'yearly':
                        newenddate.setMonth(newstartdate.getMonth() + 12);
                        break;
                    default:
                        throw new Error(`Unsupported frequency: ${frequency}`);
                }
            }
            accordionContainer.innerHTML += `
                <div class="cycle-summary cycle-${i}">
                <div class="cycle-info">
                    <span class="right-align">${formatDate(newstartdate)} - ${formatDate(newenddate)}</span>
                </div>
                <div class="income-summary border_setting">
                    <div class="box1">
                        <div class="img-container">
                            <img src="./assets/img/bill.svg">
                        </div>
                        <div class="title-container">
                            <h3>Income</h3>
                        </div>
                        <div class="cycle">
                            <span class="price-data">$${saveList[i].amount.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="box2">
                        <div class="img-container">
                            <img src="./assets/img/bills.svg">
                        </div>
                        <div class="title-container">
                            <h3>Estimated bills to pay</h3>
                        </div>
                        <div class="cycle">
                            <span class="price-data negative">-$${billList[i].amount.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="box3">
                        <div class="img-container">
                            <img src="./assets/img/savings.svg">
                        </div>
                        <div class="title-container">
                            <h3>Leftover</h3>
                        </div>
                        <div class="cycle">
                            <span class="price-data ${classname}">$${sum.toFixed(2)}</span>
                        </div>
                    </div>
    
                </div>
                    <div class="mxc border_setting">
                <button class="accordion-btn" onclick=(bills_table_open(${i})) data-index="${i}">
                    <span>Bills list</span>
                    <span class="toggle-text">${toggleText}</span>
                </button>
                <div class="panel-content" style="display: ${panelStyle}; ">
           <table>
                <tbody>
                </tbody>
                <tbody>
                   ${table}
                </tbody>
            </table>
                
                    </div>
                </div>
                </div>
                `;

        }
    }
}

function bills_table_status(index) {
    let isOpen = localStorage.getItem(`panel-open-${index}`) || false;
    return isOpen;
}

function bills_table_open(index) {
    accordionContainer.innerHTML = ``;
    let isOpen;
    if (localStorage.getItem(`panel-open-${index}`)) {
        isOpen = localStorage.getItem(`panel-open-${index}`);
    }
    else {
        localStorage.setItem(`panel-open-${index}`, true);
        isOpen = true;
    }
    if (isOpen == "true") {
        isOpen = false;
    } else {
        isOpen = true;
    }
    localStorage.setItem(`panel-open-${index}`, isOpen);
    updatebillList(dateList1);
    return isOpen;
}

function update_ct_data(bills, savings) {
    const data = {
        labels: ['Bills', 'Savings'],
        datasets: [{
            label: 'Bills vs Savings',
            data: [savings, bills],
            backgroundColor: [
                'rgba(254, 99, 98, 1)',
                'rgba(255, 255, 255, 1)',
            ],
            hoverBackgroundColor: [
                'rgba(254, 99, 98, 1)',
                'rgba(255, 255, 255, 1)',
            ],
            borderRadius: 10,
            borderWidth: 0,
            circumference: 180,
        }],
    };

    const config = {
        type: 'doughnut',
        data: data,
        options: {
            plugins: {
                legend: {
                    display: false,
                },
            },
            rotation: 270,
        },
    };

    if (window.myChart && typeof window.myChart.destroy === 'function') {
        window.myChart.destroy();
    }

    const myChart = new Chart(
        document.getElementById('myChart'),
        config
    );

    ctx = myChart.getContext("2d");
    const img = new Image();
    img.src = "./assets/img/sett.png";
    return;
}

function update_BillsTable() {
    var billLst_table_body = document.getElementById('tbl_body');
    updateList = [];
    if (billLst_table_body != null) {
        billsTable.querySelector('tbody').innerHTML = '';
        sortType = JSON.parse(localStorage.getItem("sortOrder"));
        if (sortType) {

        } else {
            localStorage.setItem("sortOrder", JSON.stringify({ name: "desc" }))
            sortType = { name: "desc" };
        }
        let sortType_Key = Object.keys(sortType);
        for (let i = 0; i < oneOffIncomes.length; i++) {
            oneOffIncomes[i].tag = "income";
            oneOffIncomes[i].frequency = "one-off";
        }

        updateList = bills.concat(oneOffIncomes);
        for (let i = 0; i < updateList.length; i++) {
            if (updateList[i].tag == "income" && updateList[i].frequency == "one-off") {
                updateList[i].key = "income-" + i;

            } else {
                updateList[i].key = "bills-" + i;
            }
        }
        if (localStorage.getItem("table_datatype")) {
            updateList = updateList.filter(list => list.tag == localStorage.getItem("table_datatype"));
            if (localStorage.getItem("table_datatype") == "all") {
                updateList = bills.concat(oneOffIncomes);
            }
            if (localStorage.getItem("table_datatype") == "bills") {
                updateList = bills;
            }
        }
        if (sortType_Key[0] == "amount" || sortType_Key[0] == "totalAmount") {
            if (sortType[sortType_Key[0]] == "asc") {
                updateList.sort(function (a, b) { return a[sortType_Key] - b[sortType_Key] });
            } else {
                updateList.sort(function (a, b) { return b[sortType_Key] - a[sortType_Key] });
            }
        } else {
            if (sortType[sortType_Key[0]] == "asc") {
                updateList.sort(function (a, b) {
                    let x = a[sortType_Key[0]].toLowerCase();
                    let y = b[sortType_Key[0]].toLowerCase();
                    if (x < y) { return -1; }
                    if (x > y) { return 1; }
                    return 0;
                });
            } else {
                updateList.sort(function (a, b) {
                    let x = a[sortType_Key[0]].toLowerCase();
                    let y = b[sortType_Key[0]].toLowerCase();
                    if (x > y) { return -1; }
                    if (x < y) { return 1; }
                    return 0;
                });
            }
        }

        let testDate = new Date(payday);
        let testdatelist = [];
        updateList.forEach((bill, index) => {
            if (bill.frequency != "one-off") {
                let date = new Date(bill.date);
                if (bill.date != "NaN-NaN-NaN") {
                    while (date < testDate) {
                        switch (payFrequency) {
                            case 'weekly':
                                date.setDate(date.getDate() + 7);
                                break;
                            case 'fortnightly':
                                date.setDate(date.getDate() + 14);
                                break;
                            case 'monthly':
                                date.setMonth(date.getMonth() + 1);
                                break;
                            case 'quarterly':
                                date.setMonth(date.getMonth() + 3);
                                break;
                            case 'yearly':
                                date.setMonth(date.getMonth() + 12);
                                break;
                            default:
                                throw new Error(`Unsupported frequency: ${frequency}`);
                        }
                    }
                    bill.date = makeStringdate(date);
                    testdatelist.push(bill);
                }
            }
        })
        updateList = testdatelist;
        updateList.forEach((bill, index) => {
            let date = new Date(bill.date);
            const yearlytotal = calculate(bill.amount, bill.frequency);
            updateList[index].totalAmount = updateList[index].tag == "income" ? yearlytotal : -yearlytotal;
            billsTable.querySelector('tbody').innerHTML += `<tr>
                <td >${bill.name}</td>
                <td class="negative right-align"><span class="price-data price-${bill.tag == "income" ? "success" : "danger"}">${bill.tag == "income" ? "" : "-"}$${bill.amount}</span></td>
                <td >${bill.frequency}</td>
                <td >${formatDate(date)}</td>
                <td >${bill.tag}</td>
                <td class="container td"><span class="price-data price-${bill.tag == "income" ? "success" : "danger"}">${bill.tag == "income" ? "" : "-"}$${yearlytotal.toFixed(2)}</span></td>
                <td class="bills negative right-align">
                    <input type="hidden" value="2024-11-9" id="update-${bill.key}">
                    <button class="secondary-btn" onclick="editemodalshow('${bill.key}')">Edit</button>
                    <button class="delete-btn" onclick="removeBill('${bill.key}')">Delete</button>
                </td>
            </tr>`;
        });
    }
}

function sortTable(colum) {
    const columns = ['name', 'amount', 'frequency', 'date', 'tag', 'totalAmount'];
    let status = localStorage.getItem("sortOrder") || "desc";
    let arrow = document.getElementById(`${colum}SortArrow`);
    let test = JSON.parse(localStorage.getItem('sortOrder')) || { name: "asc" };
    let sordorder = {};
    sordorder = {
        [colum]: "asc"
    }
    if (!test[colum]) {
        localStorage.setItem('sortOrder', JSON.stringify(sordorder));
    } else {
        if (test[colum] == "asc") {
            sordorder[colum] = "desc";
        }
    }
    for (let i = 0; i < columns.length; i++) {
        document.getElementById(`${columns[i]}SortArrow`).textContent = "";
    }
    localStorage.setItem('sortOrder', JSON.stringify(sordorder));
    arrow.textContent = sordorder[colum] === 'asc' ? '↑' : '↓';
    update_BillsTable();
}

function filterByTag() {
    let selectedTag = document.getElementById('tagFilter').value;
    localStorage.setItem("table_datatype", selectedTag);
    update_BillsTable();
}

function resetLocalStorage() {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

function importData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = JSON.parse(e.target.result);
            bills = data.bills || [];
            payFrequency = data.payFrequency || '';
            income = parseFloat(data.income) || 0;
            payday = data.payday || '';
            viewMode = data.viewMode || 'payCycle';
            darkMode = data.darkMode === true;
            tags = data.tags || ['default'];
            oneOffIncomes = data.oneOffIncomes || [];
            sortOrder = { data: "desc" };
            saveToLocalStorage();
        };
        reader.readAsText(file);
    }
    location.reload();
}

function exportData() {
    const data = {
        bills: bills,
        payFrequency: payFrequency,
        income: income,
        payday: payday,
        viewMode: viewMode,
        darkMode: darkMode,
        tags: tags,
        oneOffIncomes: oneOffIncomes
    };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    document.getElementById('dwnlink').href = url;
}

function updateIncome() {
    localStorage.clear();
    payFrequency = document.getElementById('editFrequency').value;
    income = parseFloat(document.getElementById('IncomeAmount').value);
    localStorage.setItem("income", income);
    let startdadte = new Date(document.getElementById('editPayday').value);
    payday = makeStringdate(startdadte);
    $("#incomeModal").hide();
    saveToLocalStorage();
}

function addBillList() {
    let billName = payFrequency = document.getElementById('billName').value;
    let billAmount = payFrequency = document.getElementById('billAmount').value;
    let billFrequency = payFrequency = document.getElementById('billFrequency').value;
    let billDate = payFrequency = document.getElementById('billDate').value;
    let billTag = payFrequency = document.getElementById('billTag').value;
    const newBill = { name: billName, amount: Number(billAmount), frequency: billFrequency, date: billDate, tag: billTag };
    bills.push(newBill);
    localStorage.setItem("bills", JSON.stringify(bills));
    jQuery('#billModal').hide();
}

function addIncome() {
    let incomeName = payFrequency = document.getElementById('incomeName').value;
    let oneOffIncomeAmount = payFrequency = document.getElementById('oneOffIncomeAmount').value;
    let incomeDate = payFrequency = document.getElementById('incomeDate').value;
    const newIncome = { name: incomeName, amount: Number(oneOffIncomeAmount), date: incomeDate };
    oneOffIncomes.push(newIncome);
    localStorage.setItem("oneOffIncomes", JSON.stringify(oneOffIncomes));
}

function UpdateBillsList(event) {
    event.preventDefault();
    let billName = document.getElementById('billUpdateName').value;
    let billAmount = document.getElementById('billUpdateAmount').value;
    let billFrequency = document.getElementById('billUpdateFrequency').value;
    let billDate = document.getElementById('billUpdateDate').value;
    console.log(billDate);
    
    let billTag = document.getElementById('billUpdateTag').value;
    let totalAmount = calculate(Number(billAmount), billFrequency);
    let number = document.getElementById('billUpdateIndex').value;
    document.getElementById('billUpdateIndex').number;
    const newBill = { name: billName, amount: Number(billAmount), frequency: billFrequency, key: "bills-" + number, date: billDate, tag: billTag, totalAmount: totalAmount };  
    // localStorage.setItem("testdata", JSON.stringify(newBill))
    // bills[Number(number)] = newBill;
    // let updateBillData = JSON.stringify(bills);
    // localStorage.setItem("bills", updateBillData);
    
    // // saveToLocalStorage();
    updateToLocalStorage("bills", number, newBill);
  
    setTimeout(() => {
        $("#billUpdateModal").hide();
        location.reload();
     }, 500);
    // update_BillsTable();
}
function updateToLocalStorage(storageKey, billKeyToUpdate, updatedValues){
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {     
      const data = JSON.parse(storedData);     
      data.forEach(bill => {
        if (bill.key === "bills-" + billKeyToUpdate) {
            console.log(updatedValues);
            
          Object.assign(bill, updatedValues); // Merge the updated values into the bill
        }
      });
      localStorage.removeItem("bills")
      console.log(data);
      
      localStorage.setItem("bills", JSON.stringify(data));  
    //   localStorage.setItem('bills', JSON.stringify(bills));
    //   localStorage.setItem('bills', JSON.stringify(bills));    
      console.log("Data updated successfully!");
    } else {
      console.log("No data found in localStorage for the specified key.");
    }
}
function UpdateIncomeList() {
    let incomeName = document.getElementById('updateIncomeName').value;
    let oneOffIncomeAmount = document.getElementById('updateIncomeAmount').value;
    let incomeDate = document.getElementById('updateIncomeDate').value;
    let number = document.getElementById('UpdateincomeIndex').value;
    const newIncome = { name: incomeName, amount: Number(oneOffIncomeAmount), date: incomeDate };
    oneOffIncomes[Number(number)] = newIncome;
    let updateincomeData = JSON.stringify(oneOffIncomes);
    localStorage.setItem("oneOffIncomes", updateincomeData);
    $("#oneOffIncomeUpdateModal").hide();
    saveToLocalStorage();
    location.reload();
}

function removeBill(listkey) {
    if (listkey.split("-")[0] == "income") {
        let number = Number(listkey.split("-")[1]) - bills.length;
        localStorage.setItem('oneOffIncomes', JSON.stringify(oneOffIncomes.splice(number, 1)));
        location.reload();
        saveToLocalStorage();
    } else {
        let number = Number(listkey.split("-")[1]);
        localStorage.setItem('oneOffIncomes', JSON.stringify(bills.splice(number, 1)));
        location.reload();
        saveToLocalStorage();
    }
}

function editemodalshow(listkey) {
    var dateParts;
    if (listkey.split("-")[0] == "income") {
        $("#oneOffIncomeUpdateModal").show();
        let number = Number(listkey.split("-")[1]) - bills.length;
        document.getElementById('updateIncomeName').value = oneOffIncomes[number].name;
        document.getElementById('updateIncomeAmount').value = oneOffIncomes[number].amount;
        dateParts = new Date(oneOffIncomes[number].date).toISOString().split("T")[0];
        document.getElementById('updateIncomeDate').value = oneOffIncomes[number].date;
        document.getElementById('UpdateincomeIndex').value = number;

    } else {
        $("#billUpdateModal").show();
        let number = Number(listkey.split("-")[1]);     
        document.getElementById('billUpdateName').value = bills[number].name;
        document.getElementById('billUpdateAmount').value = bills[number].amount;
        document.getElementById('billUpdateFrequency').value = bills[number].frequency;
        dateParts = new Date(bills[number].date).toISOString().split("T")[0];
        document.getElementById('billUpdateDate').value =dateParts;
        document.getElementById('billUpdateTag').value = bills[number].tag;
        document.getElementById('billUpdateIndex').value=number;

    }
}

function incomeModalShow() {
    $("#incomeModal2").show();
    document.getElementById('IncomeAmount2').value = income;
    document.getElementById('editFrequency2').value = payFrequency;
    document.getElementById('editPayday2').value = makeStringdate(payday);
    ;
}

$('a.go-back').click(function () {
    $(this).parent().parent().parent().parent().hide();
    return false;
});

function maketahlist() {
    let tagList = [];
    for (let i = 0; i < bills.length; i++) {
        let position = tagList.indexOf(bills[i].tag) + 1;
        if (position == 0) {
            tagList.push(bills[i].tag)
        }
    }
    return tagList;
}

function openManageTagsModal() {
    $("#manageTagsModal").show();
}

function loadTagInfo() {
    let tagname = document.getElementById("existingTag").value;
    document.getElementById("newTagName").value = tagname;
}

function deleteTag() {
    let tagname = document.getElementById("existingTag").value;
    bills = bills.filter(list => list.tag != tagname);
    localStorage.setItem("bills", JSON.stringify(bills));
    location.reload();
}

function renameTag() {
    let tagname = document.getElementById("existingTag").value;
    let tagrename = document.getElementById("newTagName").value;
    for (let i = 0; i < bills.length; i++) {
        if (bills[i].tag == tagname) {
            bills[i].tag = tagrename;
        }
    }
    localStorage.setItem("bills", JSON.stringify(bills));
    location.reload();
}

function makeList_monthly() {
    let testMonthlySaveList = [];
    let testMonthlyBillsList = [];
    let testMonthlyDateList = [];

    let startdate = payday;
    let nextDate = new Date(startdate);
    for (let i = 0; i < 12; i++) {
        let day = makeStringdate(nextDate);
        testMonthlyDateList[i] = day;
        testMonthlySaveList[i] = makesvelist_monthly(nextDate);
        testMonthlyBillsList[i] = makebillList_monthly(nextDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
    }
    dateList1 = testMonthlyDateList;
    saveList = testMonthlySaveList;
    billList = testMonthlyBillsList;

    update_chat(dateList1);
    update_BillsTable();
}

function makebillList_monthly(date) {
    let startdate = date;
    let enddate = new Date(startdate);
    let amount = 0;
    let billList = [];
    let bill_Listdata = {};
    let cnt = 0;

    enddate.setMonth(startdate.getMonth() + 1);

    bills.forEach(bill => {
        let date = new Date(bill.date);
        let nextDate = date;
        while (nextDate <= enddate) {
            switch (bill.frequency) {
                case 'weekly':
                    if (nextDate >= startdate && enddate >= nextDate) {
                        amount = amount + bill.amount;
                        cnt++;
                        let date = makeStringdate(nextDate);

                        billList[cnt] = {
                            amount: bill.amount,
                            name: bill.name,
                            date: date
                        }
                    }
                    nextDate.setDate(nextDate.getDate() + 7);
                    break;
                case 'fortnightly':
                    if (nextDate >= startdate && enddate >= nextDate) {
                        amount = amount + bill.amount;
                        cnt++;
                        let date = makeStringdate(nextDate);

                        billList[cnt] = {
                            amount: bill.amount,
                            name: bill.name,
                            date: date
                        }
                    }
                    nextDate.setDate(nextDate.getDate() + 14);
                    break;
                case 'monthly':
                    if (nextDate >= startdate && enddate >= nextDate) {
                        amount = amount + bill.amount;
                        cnt++;
                        let date = makeStringdate(nextDate);

                        billList[cnt] = {
                            amount: bill.amount,
                            name: bill.name,
                            date: date
                        }
                    }
                    nextDate.setMonth(nextDate.getMonth() + 1);
                    break;
                case 'quarterly':
                    if (nextDate >= startdate && enddate >= nextDate) {
                        amount = amount + bill.amount;
                        cnt++;
                        let date = makeStringdate(nextDate);
                        billList[cnt] = {
                            amount: bill.amount,
                            name: bill.name,
                            date: date
                        }
                    }
                    nextDate.setMonth(nextDate.getMonth() + 3);
                    break;
                case 'yearly':
                    if (nextDate >= startdate && enddate >= nextDate) {
                        amount = amount + bill.amount;
                        cnt++;
                        let date = makeStringdate(nextDate);

                        billList[cnt] = {
                            amount: bill.amount,
                            name: bill.name,
                            date: date
                        }
                    }
                    nextDate.setMonth(nextDate.getMonth() + 13);
                    break;
                case 'one-off':
                    if (nextDate >= startdate && enddate >= nextDate) {
                        amount = amount + bill.amount;
                        cnt++;
                        let date = makeStringdate(nextDate);

                        billList[cnt] = {
                            amount: bill.amount,
                            name: bill.name,
                            date: date
                        }
                    }
                    nextDate.setMonth(nextDate.getMonth() + 13);
                    break;
                default:
                    throw new Error(`Unsupported frequency: ${frequency}`);
            }
        }
    })
    bill_Listdata.amount = amount;
    bill_Listdata.bill_List = billList;
    return bill_Listdata;
}

function makesvelist_monthly(date) {
    let startdate = date;
    let enddate = new Date(startdate);
    let amount = 0;
    let save_List = [];
    let saveList_data = {};
    let nextDate = new Date(payday);
    let cnt = 0;
    enddate.setMonth(startdate.getMonth() + 1);
    oneOffIncomes.forEach(save => {
        let savedate = new Date(save.date);
        if (savedate >= startdate && savedate < enddate) {
            cnt++;
            amount = amount + Number(save.amount);
            save_List[cnt] = {
                amount: save.amount,
                name: save.name,
                date: save.date,
                tag: "income",
                frequency: "one-off",
            }
        }
    })
    while (nextDate < enddate) {

        if (nextDate >= startdate && nextDate < enddate) {
            cnt++;
            amount = amount + Number(income);
            let date = makeStringdate(nextDate);

            save_List[cnt] = {
                amount: income,
                name: "Income",
                date: date,
                tag: "income",
                frequency: "weekly",
            }
        }
        switch (payFrequency) {
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'fortnightly':
                nextDate.setDate(nextDate.getDate() + 14);
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            default:
                throw new Error(`Unsupported frequency: ${frequency}`);
        }
    }
    saveList_data.amount = Number(amount);
    saveList_data.saveList = save_List;
    return saveList_data;
}

function viewType(type) {
    localStorage.setItem('viewMode', type);
    viewMode = type;
    maindatashow();
    document.getElementById('accordionContainer').innerHTML = ''
    updatebillList(dateList1);
}

function makeStringdate(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let changeDate = year + "-" + month + "-" + day;
    return changeDate;
}

function formatDate(date) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const dayOfWeek = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    // Function to add the correct suffix to the day
    function getDayWithSuffix(day) {
        if (day >= 11 && day <= 13) return `${day}th`; // Special case for teens
        if (day >= 21 && day <= 23) return `${day}th`; // Special case for teens
        switch (day % 10) {
            case 1: return `${day}st`;
            case 2: return `${day}nd`;
            case 3: return `${day}rd`;
            default: return `${day}th`;
        }
    }

    return `${dayOfWeek} ${getDayWithSuffix(day)} ${month} ${year}`;
}
