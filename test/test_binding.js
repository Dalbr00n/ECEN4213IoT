const Lab7iot2 = require("../lib/binding.js");
const assert = require("assert");

assert(Lab7iot2, "The expected function is undefined");

function testBasic()
{
    const result =  Lab7iot2("hello");
    assert.strictEqual(result, "world", "Unexpected value returned");
}

assert.doesNotThrow(testBasic, undefined, "testBasic threw an expection");

console.log("Tests passed- everything looks OK!");