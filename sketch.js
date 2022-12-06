let data = [];
let FILES = ["Data/alittlelight.json","Data/allthebrightplaces.json",
	"Data/analects.json","Data/bible.json","Data/hanfeizi.json",
	"Data/interstellar.json","Data/laozi.json","Data/mengzi.json","Data/mozi.json",
	"Data/thefaultinourstars.json","Data/titanic.json","Data/words.json","Data/xunzi.json",
	"Data/zhuangzi.json"]

let emotions = ["fear","trust","surprise","positive","negative","sadness","joy","anticipation"];
let colors = ['purple','#FBF885','white',"#75FF98",'red','blue','pink','orange'];

let objects = []

let margin = 500;

let sections;

let mode = 0;

let currentsection = 0;

let myfont;

let frames = 0;

let selectedText;

let textIndex=0;

let findHighest = [0,0,0,0,0,0,0,0]
let topemotion = 0;


let chords = [
	["D2","D4", "F#4", "A4", "Db5" ], //home base
	["E2","E4","G4","B4","D5"], // 
	["F#2","F#4","A4","C#5","E5"],
	["F#2","F#4","A#4","C#5","E5"],
	["G1","G3","B3","D4"],
	["B1","B2","B3", "D4", "F#4", "A4"],
	["C#2","C#4","E4","G4","Bb4"]
]

let synth;
let freeverb;
let chord;
let waveform;
let pitchShift;
let ax;

let currentosc = "sine"
let isPlaying = true;








function preload() {
	for (let i = 0; i < FILES.length; i++) {
		data.push(loadJSON(FILES[i])); 
	}
	// synth = new Tone.PolySynth({voice: Tone.Synth, options: {oscillator: {type: "sine"}}}).toDestination();
	
	myfont = loadFont('pixel.ttf')

	reverb = new Tone.Reverb(200);
	waveform = new Tone.Waveform();
	pitchShift = new Tone.PitchShift();

	Tone.Master.connect(waveform);

	
	synth = new Tone.PolySynth({voice: Tone.FMSynth, options: {
	harmonicity  : 1 ,
	volume: -10,
	modulationIndex  : 10 ,
	detune  : 0 ,
	oscillator  : {
	type  : "sine"
	}  ,
	envelope  : {
	attack  : 1 ,
	decay  : 10 ,
	sustain  : 1 ,
	release  : 10
	}  ,
	modulation  : {
	type  : "square"
	}  ,
	modulationEnvelope  : {
	attack  : 6 ,
	decay  : 0 ,
	sustain  : 1 ,
	release  : 0.5
	}
	}}).chain(pitchShift, reverb, Tone.Master)
}


function setup() {
	sections = data[textIndex]["sections"].length;
	textFont(myfont);
	createCanvas(windowWidth, windowHeight);
	ax = width/4
	background(0,0,0,255);
	// background(92,116,183,255);
	pitchShift.pitch = floor(random(0,6));
	
	sel = createSelect();
  sel.position(width/2-60, 150);
	sel.option('-');
	for (let i = 0; i < FILES.length; i++) {
		sel.option(FILES[i].replace("Data/","").replace(".json",""))
	}
	sel.selected('-');
  sel.changed(mySelectEvent);
	noLoop();
}

function draw() {
	if (mode == 1) {
		frames = frameCount;
		push();
		textSize(100)
		textAlign(CENTER)
		fill('white')
		text("DAO",width/2,1.1*height/2)
		pop();
	}
	if (currentsection == sections) {
		currentsection = 0;
	}
	background(92,116,183,1);
	// background(188,91,91,2);
	// background(91,186,114,2);
	
	if (currentsection ==0) {
		currentosc = "sine"
	}
	if (currentsection ==6) {
		currentosc = "triangle"
	}
	
	if (currentsection == 13) {
		currentosc = "square"
	}
	
	//update emotions
	if (mode == 2) {
		for(let i = 0; i < emotions.length; i++) {
			objects[i].update();
			objects[i].show();
			objects[i].move();
		}
		if ((frameCount-frames+1) % 300 == 0 ){
			currentsection++
			isPlaying = false;
		
		}
	}
	topemotion = emotions[findHighest.indexOf(Math.max(...findHighest))];
	
	//draw waveforms
	push();
	fill(92,116,183,255)
	noStroke();
	rectMode(CORNERS);
	rect(0,0,width/3.99,height);
	rect(width,0,width/1.335,height);
	rect(0,13*height/15,width,height)
	rect(0,0,width,2*height/15);
	if (mode ==1) {
		fill('white');
		textAlign(CENTER);
		textSize(25);
		text("(click to continue)", width/2, 18.1*height/20)
	}
	noFill();
	stroke('white');
	let buffer = waveform.getValue(0); //gets left channel
	
	let start = 0;
	for (let i =1; i < buffer.length; i++) {
		if (buffer[i-1] < 0 && buffer[i] >= 0) {
			start = i;
			break;
		}
	}
	let end = buffer.length/2+start;
	
	beginShape();
	for (let i = start; i < end; i++) {
		let x = map(i,start,end,0,5*width/20);
		let y = map(buffer[i],-10,10,0,height,true);
		vertex(x,y);
	}
	endShape();
	beginShape();
	for (let i = start; i < end; i++) {
		let x = map(i,start,end, width,15*width/20);
		let y = map(buffer[i],-10,10,0,height,true);
		vertex(x,y);
	}
	endShape();
	pop();
	
	
	if (isPlaying == false) {
		synth.options.oscillator.type = currentosc;
		synth.options.harmonicity = random([1,5]);
		synth.triggerRelease(chord);
		const now = Tone.now()
		findChord();
		synth.triggerAttack(chord, now+1);
		isPlaying = true;
	}

	push();
	fill('black')
	rectMode(CENTER);
	rect(width/8,1.4*height/6, 100)
	fill('white')
	textAlign(CENTER);
	noStroke();
	textSize(20);
	text("section\n" +currentsection + "/20", width/8, 1.4*height/6);
	text(data[textIndex]["title"], width/2, 100);
	pop();
	
	//draw timeline
	push()
	stroke('white')
	line(width/4,14*height/15, 3*width/4,14*height/15);
	line(width/4,14*height/15-15,width/4,14*height/15+15);
	line(3*width/4,14*height/15-15,3*width/4,14*height/15+15);
	drawCirc();
	pop()
	if (mode != 0) {
		for (let i = 0; i < emotions.length; i++) {
			push();
			textAlign(LEFT);
			noStroke()
			textSize(15);
			fill('white');
			text(emotions[i],4.1*width/5, (3+i)*height/25);
			fill(colors[i]);
			rectMode(CENTER);
			let tempsize = 10;
			if (topemotion == emotions[i] && mode == 2) {
				tempsize = 20;
				stroke('white')
			}
			rect(4*width/5,(3+i)*height/25-5, tempsize);
			pop();
		}
	}
	
	if (mode == 0) {
		push();
		rectMode(CORNERS)
		fill('black')
		rect(0,0,width,height)
		textAlign(CENTER);
		noStroke();
		fill('white')
		textSize(20);
		text("Choose a text to translate",width/2,100);
		pop();
		
	}
}


function playsound() {
	const now = Tone.now()
	chord = ["D2","A2"];
	synth.triggerAttack(chord, now);

}

class Emotion {
	constructor(index) {
		this.index = index
		this.name = emotions[index];
		this.color = colors[index]
		// this.color = colors[index];
		this.totalemotion = data[textIndex][emotions[index]];
		this.emotion = [];
		for(let i = 0; i < sections; i++) {
			this.emotion.push(data[textIndex]["sections"][i][emotions[index]]) 
		
		}
		this.x = margin + (index+1)*(width-2*margin)/11;
		this.y = height/2; 
		this.speed = 100;
		this.size = 2;
	}
	show() {
		push();
		fill(this.color)
		strokeWeight(.25);
		noStroke();
		rectMode(CENTER);
		rect(this.x, this.y, this.size);
		pop();

	}
	
	move() {
		this.x += random(-this.speed,this.speed)
		this.y += random(-this.speed,this.speed)
	}
	update() {
		let d = dist(width/2,height/2,this.x,this.y);
		if (d > 310) {
			this.x = width/2 + random(-100,100);
			this.y = height/2 +random(-100,100);
		}
		this.currentemotion = this.emotion[currentsection]
		try {
			this.previousemotion = this.emotion[currentsection-1];
		}
		finally{
			this.previousemotion = this.totalemotion;
		}
		this.speed = pow(this.currentemotion/this.totalemotion,3)*3
		this.size= pow(this.currentemotion/this.totalemotion,3) *15
		if (this.size > 100) {
			this.size = 100;
		}
		
		findHighest[this.index] = this.size
		
	}
}

function mouseClicked() {
	if (mode ==1) {
		for(let j = 0; j < emotions.length; j++) {
			objects.push(new Emotion(j))
		}
		playsound();
		push();
		rectMode(CORNERS)
		fill('black')
		rect(0,0,width,height)
		pop();
		mode =2;
	}
}

function mySelectEvent() {
  selectedtext = sel.value();
	textIndex = FILES.indexOf("Data/"+selectedtext+".json")
	mode=1;
	sel.remove();
	loop();
}

function findChord() {
	switch (topemotion) {
		case 'positive':
		chord = random([chords[0],chords[1]])
		break;	
		case 'negative':
		chord = random([chords[5],chords[2]])
		break;	
		case 'fear':
		chord = random([chords[5],chords[6]])
		break;
		case 'trust':
		chord = random([chords[0],chords[1], chords[3]])
		break;
		case 'surprise':
		chord = random([chords[0],chords[3],chords[2]])
		break;
		case 'sadness':
		chord = random([chords[5],chords[2],chords[4]])
		break;
		case 'joy':
		chord = random([chords[0],chords[4]])
		break;
		case 'anticipation':
		chord = random([chords[3],chords[2]])
		break;
	}
}

function drawCirc() {
	push();
	fill('white');
	if (currentsection == 0) {
		ax = width/4;
	}
	let cx = map(currentsection, 0,19,width/4,3*width/4)
	let cy = 14*height/15;
	if (mode ==2 && ax < cx) {
		ax +=.2;
	}
	circle(ax,cy,10)
	
}



