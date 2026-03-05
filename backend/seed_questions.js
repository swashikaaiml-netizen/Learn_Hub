const mongoose = require('mongoose');
const Question = require('./models/Question');
const Course = require('./models/Course');

const MONGO_URI = 'mongodb://127.0.0.1:27017/learnhub';

const questions = [
    {
        courseTitle: 'Complete 2026 Web Development Bootcamp',
        q: [
            { text: 'What does HTML stand for?', a: 'Hyper Text Markup Language', b: 'High Tech Modern Language', c: 'Hyper Transfer Markup Language', d: 'Home Tool Markup Language', correct: 'a' },
            { text: 'Which property is used to change background color in CSS?', a: 'color', b: 'bgcolor', c: 'background-color', d: 'color-background', correct: 'c' },
            { text: 'Which tag is used for an external JavaScript file?', a: '<script>', b: '<js>', c: '<javascript>', d: '<link>', correct: 'a' },
            { text: 'What is the correct syntax for a comment in CSS?', a: '// comment', b: '/* comment */', c: '<!-- comment -->', d: '# comment', correct: 'b' },
            { text: 'Which HTML element is used for the largest heading?', a: '<h6>', b: '<head>', c: '<h1>', d: '<heading>', correct: 'c' },
            { text: 'How do you create a function in JavaScript?', a: 'function:myFunction()', b: 'function myFunction()', c: 'function = myFunction()', d: 'def myFunction()', correct: 'b' },
            { text: 'Which CSS property controls the text size?', a: 'font-style', b: 'text-size', c: 'font-size', d: 'text-style', correct: 'c' },
            { text: 'Which event occurs when a user clicks on an HTML element?', a: 'onmouseover', b: 'onchange', c: 'onclick', d: 'onmouseclick', correct: 'c' },
            { text: 'What is the correct way to write a JavaScript array?', a: 'var colors = "red", "green"', b: 'var colors = (1:"red", 2:"green")', c: 'var colors = ["red", "green"]', d: 'var colors = 1=("red"), 2=("green")', correct: 'c' },
            { text: 'How do you add a background color for all <h1> elements?', a: 'h1 {background-color: #FFFFFF;}', b: 'all.h1 {background-color: #FFFFFF;}', c: 'h1.all {background-color: #FFFFFF;}', d: 'h1:all {background-color: #FFFFFF;}', correct: 'a' }
        ]
    }
];

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to seed...');

    for (const group of questions) {
        const course = await Course.findOne({ title: group.courseTitle });
        if (course) {
            console.log(`Seeding for ${course.title}...`);
            for (const qData of group.q) {
                const q = new Question({
                    courseId: course._id,
                    questionText: qData.text,
                    options: { a: qData.a, b: qData.b, c: qData.c, d: qData.d },
                    correctAnswer: qData.correct
                });
                await q.save();
            }
        }
    }
    console.log('Seeding complete.');
    process.exit();
}

seed();
