let numbers =[3,4];

numbers.push(5,6); // [3,4,5,6]
numbers.unshift(1,2); // [1,2,3,4,5,6]
numbers.splice(2,0,'a','b'); // [1,2,a,b,3,4,5,6]

numbers = [1,2,3,1,4];
console.log(numbers.indexOf(1,2)); // 3
console.log(numbers.lastIndexOf(1)); // 3
console.log(numbers.indexOf(1)!==-1); // true
console.log(numbers.includes(1)); // true