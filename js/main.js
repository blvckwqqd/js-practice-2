class Item {
    constructor(code, name, level) {
        this.code = code;
        this.name = name;
        this.level = level;
    }
}
let data = [];
let activeTr = null;

const input = document.getElementsByClassName('Input-region')[0];

input.oninput = () => {
    let rows = document.getElementsByClassName('row');
    if (input.value.length > 3) {
        for (let i = 0; i < rows.length; i++) {
            let isContain = rows.item(i).childNodes[1].textContent.includes(input.value);
            if (!isContain) rows.item(i).style.display = 'none';
        }
    } else {
        for (let i = 0; i < rows.length; i++) {
            rows.item(i).style.display = 'flex';
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    data = await loadRegex('big.csv');
    displayTable(filterList(data), "Container");
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

        if (splitedItem[3] == '000' && splitedItem[2] == '000') {
            list.push(new Item(
                '' + splitedItem[0] + '-' + splitedItem[1] + '-' + splitedItem[2] + '-' + splitedItem[3],
                splitedItem[6],
                splitedItem[5]));
        }
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
    let table = document.createElement('table');
    if (tableName != null) table.classList.add(tableName);

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

    for (let i = 0; i < list.length; i++) {
        let tr = table.insertRow();
        tr.classList.add('row');
        for (const key in list[i]) {
            let td = tr.insertCell();
            td.textContent = list[i][key];
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

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
    div.appendChild(table);
}

const displaySubTable = (list, elem) => {
    //let arr = list.filter(item => item.level == '2');
    let existingTable = document.getElementsByClassName('Secondary')[0];
    if (existingTable) existingTable.remove();
    let table = document.createElement('table');
    table.classList.add('Secondary');

    // Обойтись без split'a(substring)
    let arr = filterList(list, elem, true);
    if (arr.length == 0) return;
    // Рисование таблицы
    for (let i = 0; i < arr.length; i++) {
        let tr = table.insertRow();
        for (const key in arr[i]) {
            let td = tr.insertCell();
            td.textContent = arr[i][key];
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    table.onclick = (e) => {
        let tr = e.target.closest('tr');
        if (tr.parentElement.classList.contains('Cities')) return;
        setActiveElement(tr);
        let list = filterList(data, activeTr, false, true);
        if (list.length == 0) return;
        cityTable = document.getElementsByClassName('Cities')[0]
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
        let [code1T, code2T, code3T] = elem.firstChild.textContent.split('-');

        arr = list.filter(item => {
            let [code1, code2, code3, code4] = item.code.split('-');
            return item.level != '1' && code1 == code1T && code2 == code2T && code3 == code3T && code4 != '000';
        })

    } else if (isRegion && elem != null) {
        let code1T = elem.firstChild.textContent.split('-')[0];
        arr = list.filter(item => {
            let [code1, code2, code3] = item.code.split('-');
            return item.level != '2' && code1 == code1T && code2 != '000' && code3 == '000';
        })
    } else {
        arr = list.filter(item => item.level != '2' && item.code.split('-')[1] == '000')
    }
    return arr;
}




const setLoading = () => {
    if (document.body.style.filter) document.body.style.filter = '';
    else document.body.style.filter = 'blur(2px)';
}