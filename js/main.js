class Item {
    constructor(code, name, level) {
        this.code = code;
        this.name = name;
        this.level = level;
    }
}
let data = [];
let activeTr = null;
let citiesSorted = [];

const input = document.getElementsByClassName('Input-region')[0];

input.oninput = () => {
    let rows = document.getElementsByClassName('row');
    let table = document.getElementsByClassName('Secondary')[0];
    let cities = document.getElementsByClassName('Cities')[0];
    if (input.value.length > 3) {
        for (let i = 0; i < rows.length; i++) {
            let isContain = rows.item(i).childNodes[1].textContent.toLowerCase().includes(input.value.toLowerCase());
            if (!isContain) rows.item(i).style.display = 'none';
            if (table) table.style.display = 'none'
            if (cities) cities.remove();
        }
    } else {
        for (let i = 0; i < rows.length; i++) {
            rows.item(i).style.display = 'flex';
            if (table) table.style.display = 'flex';
        }
    }
}

const select = document.getElementsByClassName('Selector')[0];
select.addEventListener('change', async (e) => {
    let time;
    switch (e.target.value) {
        case "regex":
            time = Date.now()
            data = await loadRegex('big.csv');
            document.getElementsByClassName('Primary')[0].remove();
            displayTable(filterList(data), "Container");
            console.log(Date.now() - time);
            break;
        case "split":
            time = Date.now()
            data = await loadSplit('big.csv');
            document.getElementsByClassName('Primary')[0].remove();
            displayTable(filterList(data), "Container");
            console.log(Date.now() - time);
            break;

        default:
            console.log('Nothing loaded :(');
            break;
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    data = await loadRegex('big.csv');
    displayTable(filterList(data), "Container");
    citiesSorted = data.filter(item =>
        item.level == '2'
        && item.code.split('-')[3] != '000')
        .sort((a, b) => a.name.localeCompare(b.name)
        );
})


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
        //pre.textContent+=item;
    }
    document.body.appendChild(pre);
}

const displayTable = (list, name, tableName = null) => {
    let div = document.getElementsByClassName(name)[0];
    //if(!table.classList.contains('Secondary') && tableName == null) div.firstChild.remove();
    let table = generateTable(list);
    if (tableName != null) table.classList.add(tableName);

    if (!table.classList.contains('Secondary') && tableName == null) {
        table.onclick = (e) => {
            let tr = e.target.closest('tr');
            //console.log(tr.parentElement);
            if (tr.parentElement.classList.contains('head')) return;
            if (activeTr == tr) {
                displayNonActive();
                removeActiveElement();
                return;
            };
            setActiveElement(tr);
            displaySubTable(data, activeTr);
        }
    }
    if(tableName == null) div.prepend(table);
    else div.appendChild(table);
    
}

const displaySubTable = (list, elem) => {

    let existingTable = document.getElementsByClassName('Secondary')[0];
    if (existingTable) existingTable.remove();

    let arr = filterList(list, elem, true);
    if (arr.length == 0) return;
    // Рисование таблицы
    let table = generateTable(arr, true);

    table.onclick = (e) => {
        let tr = e.target.closest('tr');
        if (tr.parentElement.classList.contains('Cities')) return;
        setActiveElement(tr);
        let list = filterList(data, activeTr, false, true);
        if (list.length == 0) {
            alert('Empty');
            return;
        }
        cityTable = document.getElementsByClassName('Cities')[0];
        if (cityTable) cityTable.remove();
        displayTable(list, 'Container', 'Cities');
    }
    hideNonActive();
    elem.insertAdjacentElement('afterEnd', table);

}

const hideNonActive = () => {
    let rows = document.getElementsByClassName('row');
    removeSubTable();

    for (let i = 0; i < rows.length; i++) {
        let isContain = rows.item(i).classList.contains('active');
        if (!isContain) rows.item(i).style.display = 'none';
    }
}

const displayNonActive = () => {
    let rows = document.getElementsByClassName('row');
    removeSubTable();

    for (let i = 0; i < rows.length; i++) {
        rows.item(i).style.display = 'flex';
    }
}

const removeSubTable = () => {
    let existingTable = document.getElementsByClassName('Secondary')[0];
    if (existingTable) existingTable.remove();
}

const removeActiveElement = () => {
    let item = document.getElementsByClassName('active')[0];
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
        arr = list.filter(item => {
            let [code1, code2, _, code4] = item.code.split('-');
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
        table.classList.add('Primary');
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