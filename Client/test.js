
function A() {
    
}

function B() {
    
}

function inherit(subType, superType) {
    var prototype = Object.create(superType.prototype);
    prototype.constructor = subType;
    subType.prototype = prototype;
}

inherit(A, B);

var a = new A;


console.log("a instanceof A: " + (a instanceof A));
console.log("a instanceof B: " + (a instanceof B));

console.log("!{}: " + !{});
console.log("{} == {}: " + {} == {});
