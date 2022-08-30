class Item {
    constructor(code, name, level) {
        this.code = code;
        this.name = name;
        this.level = level;
    }
}
let data = [];
let activeTr = null;

// оставлять регион подсвеченным
const inputRegion = document.querySelector('.Input-region');

inputRegion.oninput = () => {
    // querySelector .class
    let rows = document.querySelectorAll('.Primary > .row');
    let subTable = document.querySelector('.Secondary');
    let cities = document.querySelector('.Cities');
    if (inputRegion.value.length > 3) {
        for (const row of rows) {
            let isContain = row.childNodes[1].textContent.toLowerCase().includes(inputRegion.value.toLowerCase());
            if (!isContain) row.classList.add('NonVisible');
        }
        if (subTable) subTable.remove();
        if (cities) cities.remove();
    } else {
        for (const row of rows) {
            row.classList.remove('NonVisible');
        }
    }
}
const inputCity = document.querySelector('.Input-city');

inputCity.oninput = () => {
    let rows = document.querySelectorAll('.Cities > .row');

    if (inputCity.value.length > 2) {
        for (const row of rows) {
            let isContain = row.childNodes[1].textContent.toLowerCase().includes(inputCity.value.toLowerCase());
            if (!isContain) row.classList.add('NonVisible');
        }
    } else {
        for (const row of rows) {
            row.classList.remove('NonVisible');
        }
    }

}
// Select event
const select = document.querySelector('.Selector');

select.addEventListener('change', async (e) => {
    let time;
    switch (e.target.value) {

        case "regex":
            time = Date.now()
            data = await loadRegex('big.csv');
            console.log(Date.now() - time);
            document.getElementsByClassName('Primary')[0].remove();
            displayTable(filterList(data), "Container");
            break;

        case "split":
            time = Date.now()
            data = await loadSplit('big.csv');
            console.log(Date.now() - time);
            document.getElementsByClassName('Primary')[0].remove();
            displayTable(filterList(data), "Container");
            break;

        default:
            console.log('Nothing loaded :(');
            break;
    }
});

// Load content on page start

document.addEventListener("DOMContentLoaded", async () => {
    data = await loadRegex('big.csv');
    displayTable(filterList(data), "Container");
})

// parse file by regex pattern and fill items array
const loadRegex = async (name) => {

    let result = await fetch('/data/' + name, {
        headers: {
            'Content-Type': 'text/plain',
        }
    });
    if (!result.ok) return null;
    let text = await result.text();

    const regex = /(\d+)\";\"(\d+)\";\"(\d+)\";\"(\d+)\";\"\d\";\"(\d+)\";\"(.*?)\";+/gm
    let res = text.matchAll(regex);
    let arr = [];

    for (let item of res) {
        arr.push(new Item(
            '' + item[1] + '-' + item[2] + '-' + item[3] + '-' + item[4],
            item[6],
            item[5])
        );
    }

    return arr;

}

const loadSplit = async (name) => {
    let result = await fetch('/data/' + name, {
        headers: {
            'Content-Type': 'text/plain',
        }
    });

    if (!result.ok) return null;
    let text = await result.text();

    let textNewLine = text.split("\n");
    let list = [];
    for (let item of textNewLine) {
        let splitedItem = item.replace(/\"/g, '').split(';');
        list.push(new Item(
            '' + splitedItem[0] + '-' + splitedItem[1] + '-' + splitedItem[2] + '-' + splitedItem[3],
            splitedItem[6],
            splitedItem[5]));
    }
    return list;
}

const displayList = (list) => {
    let pre = document.createElement('pre');
    for (let item of list) {
        let p = document.createElement('p');
        p.textContent = item.name + '-' + item.code + '-' + item.level;
        pre.appendChild(p);
    }
    document.body.appendChild(pre);
}
// right r left
const displayTable = (list, className, tableName = null) => {
    let div = document.querySelector('.' + className);
    let table = generateTable(list);
    if (tableName != null) table.classList.add(tableName);
    else table.classList.add('Primary');
    // он клик вынести глобально
    if (!table.classList.contains('Secondary') && tableName == null) {
        table.onclick = (e) => {
            let tr = e.target.closest('tr');
            //console.log(tr.parentElement);
            if (tr.parentElement.classList.contains('head')) return;
            else if (activeTr == tr) {
                displayNonActive();
                removeActiveElement();
                return;
            };
            setActiveElement(tr);
            displaySubTable(data, activeTr);
            //active Dom table
        }
    }
    // rerender
    if (tableName == null) div.prepend(table);
    else div.appendChild(table);

}

const displaySubTable = (list, elem) => {

    let existingTable = document.querySelector('.Secondary');
    if (existingTable) existingTable.remove();

    let arr = filterList(list, elem, true);
    if (arr.length == 0) return;
    // Рисование таблицы
    let table = generateTable(arr, true);

    table.onclick = (e) => {
        let tr = e.target.closest('tr');
        if (tr.parentElement.classList.contains('Cities')) return;
        setActiveElement(tr);
        // active list
        let list = filterList(data, activeTr, false, true);
        cityTable = document.querySelector('.Cities');
        if (cityTable) cityTable.remove();
        if (list.length == 0) {
            console.log('Empty region');
            return;
        } else {
            displayTable(list, 'Container', 'Cities');
        }
    }
    hideNonActive();
    elem.insertAdjacentElement('afterEnd', table);

}

const hideNonActive = () => {
    let rows = document.getElementsByClassName('row');
    removeSubTable();

    for (const row of rows) {
        // class or style
        let isContain = row.classList.contains('active');
        if (!isContain) row.classList.add('NonVisible');
    }
}

const displayNonActive = () => {
    let rows = document.getElementsByClassName('row');
    removeSubTable();
    for (const row of rows) {
        row.classList.remove('NonVisible');
    }
}

const removeSubTable = () => {
    let existingTable = document.querySelector('.Secondary');
    if (existingTable) existingTable.remove();
}

const removeActiveElement = () => {
    //querySelector .class
    let item = document.querySelector('.active');
    if (item) item.classList.remove('active');
    activeTr = null;
}

const setActiveElement = (tr) => {
    if (activeTr) activeTr.classList.remove('active');
    activeTr = tr;
    activeTr.classList.add('active');
}

const filterList = (list, elem = null, isRegion = false, isCity = false) => {
    let arr;

    if (isCity && elem != null) {
        // test matchall or match code
        arr = list.filter(item => {
            let [code1, code2, _, code4] = item.code.match(/(\d+)-(\d+)-(\d+)-(\d+)/).slice(1, -1);
            let [code1T, code2T] = elem.firstChild.textContent.split('-');
            return item.level == '2' && code1 == code1T && code2 == code2T && code4 != '000';
        })

    } else if (isRegion && elem != null) {
        arr = list.filter(item => {
            let [code1T] = elem.firstChild.textContent.split('-');
            let [code1, code2, code3] = item.code.split('-');
            return item.level != '2' && code1 == code1T && code2 != '000' && code3 == '000';
        })
    } else {
        arr = list.filter(item => item.level != '2' && item.code.split('-')[1] == '000')
    }
    return arr;
}

const generateTable = (list, isSub = false) => {
    let table = document.createElement('table');
    if (!isSub) {
        let thead = document.createElement('thead');
        thead.classList.add('head');
        let thr = thead.insertRow();
        let thdCode = thr.insertCell();
        thdCode.textContent = 'Код';
        let thdName = thr.insertCell();
        thdName.textContent = 'Название';
        let thdLevel = thr.insertCell();
        thdLevel.textContent = 'Уровень';
        table.appendChild(thead);
    }
    else table.classList.add('Secondary');
    for (let i = 0; i < list.length; i++) {
        let tr = table.insertRow();
        if (!isSub) tr.classList.add('row');
        for (const key in list[i]) {
            let td = tr.insertCell();
            td.textContent = list[i][key];
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    return table;
}