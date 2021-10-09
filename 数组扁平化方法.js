var arr = [1, [2, [3, 4, 5]]]
// 数组扁平化


function arrFlatten(arr){
    let result = [];
    // 循环递归 for forEach map 
    // for(let i  = 0; i < arr.length; i++){
    //     if(Array.isArray(arr[i])){
    //         result = result.concat(arrFlatten(arr[i]))
    //     }else{
    //         result.push(arr[i])
    //     }
    // }
    // arr.forEach(item => {
    //     if(Array.isArray(item)){
    //         result = result.concat(arrFlatten(item))
    //     }else{
    //         result.push(item)
    //     }
    // })

    // reduce 递归
    // return arr.reduce((result,item) => result.concat(Array.isArray(item) ? arrFlatten(item) : item),[])
    
    // toString & split
    // return arr.toString().split(',').map(item => Number(item))
    
    // join & split
    // return arr.join().split(',').map(item => Number(item));
    
    //  ... ES6 扩展运算符
    while(arr.some(item => Array.isArray(item))){
        arr = [].concat(...arr)
    }
    return arr;
    return result
}

console.log(arrFlatten(arr));