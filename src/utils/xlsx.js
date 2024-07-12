import fs from "file-saver";
import XLSX from "xlsx";

// 导出excel文件
// 该方法需要传3个参数，分别是: json格式化数据，标头对象，文件名
export function xlsx(json, fields, filename = ".xlsx") {
  // 导出xlsx
  json.forEach((item)=>{
    for(let i in item) {
      if(fields.hasOwnProperty(i)) {
        item[fields[[i]]] = item[i];
      }
      delete item[i]; // 删除原先的对象属性
    }
  });

  let sheetName = filename; // excel的文件名称
  let wb = XLSX.utils.book_new(); // 工作簿包含一个SheetNames数组，以及一个表对象映射名称到表对象，XLSX.utils
  let ws = XLSX.utils.json_to_sheet(json, {header: Object.values(fields)}); //将JS对象数组转换为工作表。
  wb.SheetNames.push(sheetName);
  wb.Sheets[sheetName] = ws;
  const defaultCellStyle = {
    font: { name: "Verdana", sz: 13, color: "#FF00FF88"},
    fill: { fgColor: {rgb: "FFFFAA00"}}
  }; 
  let wopts = {
    bookType: "xlsx",
    bookSST: false,
    type: "binary",
    cellStyles: true,
    defaultCellStyle: defaultCellStyle,
    showGridLines: false
  }; // 写入样式
  let wbout = XLSX.write(wb, wopts);
  let blob = new Blob([s2ab(wbout)], {type: "application/octet-stream"});
  fs.saveAs(blob, filename + ".xlsx");
}

const s2ab = (s) => {
  let buf = new ArrayBuffer(s.length);
  let view = new Uint8Array(buf);
  for(let i = 0; i != s.length; ++i) {
    view[i] = s.charCodeAt(i) & 0xFF;
  }
  return buf;
}