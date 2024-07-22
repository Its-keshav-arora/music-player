function correctFormat(text)
{
    let arr = text.split(' ');
    for(let i = 0; i < arr.length; i++)
    {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1).toLowerCase();
    }
    const result = arr.join(' ');
    return result;
}

module.exports = correctFormat;