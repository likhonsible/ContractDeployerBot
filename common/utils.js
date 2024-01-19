const escape_markdown = (text) => {
    return text.replace(/([\.\+\-\|\(\)\#\_\[\]\~\=\{\}\,\!\`\>\<])/g, "\\$1").replaceAll('"','`')
}

const format_number = (number, decimals = 2) => {
    const str = Number(number).toFixed(decimals)
    return str.replace(/\.?0+$/g, '')
}
    
module.exports = {
    escape_markdown,
    format_number,
}