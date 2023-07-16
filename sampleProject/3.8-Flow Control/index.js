let x = 2
if (x > 3){
    console.log("x is bigger than 3")
}
else if (x > 2){
    console.log("x is bigger than 2")
}
else {
    console.log("x is not bigger than 2 or 3")
}

const circle = {
    radius: 5,
    color: 'blue',
    position: 'absolute'
};

if ('radius' in circle) {
console.log('yes');
}

const shoppingList = ['apple','melon','pear','eggs','milk','flour'];
for (let i=0;i<shoppingList.length;i++){
    console.log(shoppingList[i])
} // repeats until each item in the array is displayed in console.