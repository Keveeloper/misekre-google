const { encode } = require('@toon-format/toon');

const data = {
  id: "123",
  amount: 4200000,
  type: "INCOME",
  date: new Date(),
  user: {
    id: "uuid1",
    telegramId: "12345"
  },
  category: {
    id: "uuid2",
    name: "Alimentación"
  }
};

try {
  console.log("Encode single:", encode(data));
} catch(e) {
  console.log("Error single:", e);
}

try {
  console.log("Encode plain:", encode(JSON.parse(JSON.stringify(data))));
} catch(e) {
  console.log("Error plain:", e);
}

try {
  console.log("Encode array:", encode([data]));
} catch(e) {
  console.log("Error array:", e);
}
