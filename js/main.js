class Item {
    constructor(code, name, level) {
        this.code = code;
        this.name = name;
        this.level = level;
    }
}
let data = [];
let activeTr = null;

let input = document.getElementsByClassName('Input-region')[0];
let rows = document.getElementsByClassName('row');
input.oninput = () => {
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
    data = await loadSplit('big.csv');

    displayTable(data.filter(elem => elem.level != '2' && elem.code.split('-')[1] == '000'), "Container");
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
//TODO displayfiltered()
//TODO Рендер с параметром(нужны регионы\нет)
const displayTable = (list, name) => {
    let div = document.getElementsByClassName(name)[0];
    let table = document.createElement('table');


    let thead = document.createElement('thead');
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
        for (const key in list[i]) {
            let td = tr.insertCell();
            td.textContent = list[i][key];
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    if (!table.classList.contains('Secondary')) {
        table.onclick = (e) => {
            let tr = e.target.closest('tr');
            if (activeTr == tr) return;
            if (activeTr) activeTr.classList.remove('active');
            activeTr = tr;
            activeTr.classList.add('active');
            displaySubTable(data, activeTr);
        }
    }

    div.appendChild(table);


}

const displaySubTable = (list, elem) => {
    //let arr = list.filter(item => item.level == '2');
    let table = document.createElement('table');
    table.classList.add('Secondary');

    // Обойтись без split'a(substring)
    list = list.filter(item => {
        let [code1, code2, code3, code4] = item.code.split('-');
        let [code1T, code2T, code3T, code4T] = elem.firstChild.textContent.split('-');
        return item.level != '2' && code1 == code1T && code2 != '000';

    })
    // Рисование таблицы
    for (let i = 0; i < list.length; i++) {
        let tr = table.insertRow();
        for (const key in list[i]) {
            let td = tr.insertCell();
            td.textContent = list[i][key];
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    elem.insertAdjacentElement('afterEnd',table);

}

const setLoading = () => {
    if (document.body.style.filter) document.body.style.filter = '';
    else document.body.style.filter = 'blur(2px)';
}
