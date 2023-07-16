function greet(name){
    console.log('Hi ' + name);
}

function squared(number){
    return number * number;
}

greet('Ali');
console.log(squared(8));

function sayHello() {
	console.log('Hello!')
};

sayHello() //returns “Hello” in console, doesn’t require any argument to work.

function walk(){
    console.log('walk');
}

let run = function() {
    console.log('run');
};

let move = run;
move(); // returns “run” in the console.