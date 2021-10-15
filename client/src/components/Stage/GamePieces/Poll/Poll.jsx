import React, { forwardRef } from 'react';
import './Poll.css';
import Draggable from 'react-draggable';
import "survey-react/survey.css";
import * as Survey from "survey-react";

const surveyJson1 = {
  questions: [
    {
      name: "name",
      type: "text",
      title: "Please enter your name:",
      placeHolder: "Jon Snow",
      isRequired: true,
      autoComplete: "name"
    }, {
      name: "birthdate",
      type: "text",
      inputType: "date",
      title: "Your birthdate:",
      isRequired: true,
      autoComplete: "bdate"
    }, {
      name: "color",
      type: "text",
      inputType: "color",
      title: "Your favorite color:"
    }, {
      name: "email",
      type: "text",
      inputType: "email",
      title: "Your e-mail:",
      placeHolder: "jon.snow@nightwatch.org",
      isRequired: true,
      autoComplete: "email",
      validators: [
        {
          type: "email"
        }
      ]
    }
  ]
};

const surveyJson2 = {
  questions: [
      {
          type: "matrix",
          name: "Quality",
          title: "Please indicate if you agree or disagree with the following statements",
          columns: [
              {
                  value: 1,
                  text: "Strongly Disagree"
              }, {
                  value: 2,
                  text: "Disagree"
              }, {
                  value: 3,
                  text: "Neutral"
              }, {
                  value: 4,
                  text: "Agree"
              }, {
                  value: 5,
                  text: "Strongly Agree"
              }
          ],
          rows: [
              {
                  value: "affordable",
                  text: "Product is affordable"
              }, {
                  value: "does what it claims",
                  text: "Product does what it claims"
              }, {
                  value: "better then others",
                  text: "Product is better than other products on the market"
              }, {
                  value: "easy to use",
                  text: "Product is easy to use"
              }
          ]
      }
  ]
};

const surveyJson3 = {
  questions: [
      {
          type: "checkbox",
          name: "car",
          title: "What car are you driving?",
          isRequired: true,
          hasNone: true,
          colCount: 4,
          choices: [
              "Ford",
              "Vauxhall",
              "Volkswagen",
              "Nissan",
              "Audi",
              "Mercedes-Benz",
              "BMW",
              "Peugeot",
              "Toyota",
              "Citroen"
          ]
      }
  ]
};

var surveyJson4 = {
  "pages": [
      {
          "name": "page1",
          "elements": [
              {
                  "type": "ranking",
                  "name": "smartphone-features",
                  "title": "Please rank the following smartphone features in order of importance:",
                  "isRequired": true,
                  "choices": [
                      "Battery life",
                      "Screen size",
                      "Storage space",
                      "Camera quality",
                      "Durability",
                      "Processor power",
                      "Price"
                  ]
              }
          ]
      }, {
          "name": "page2",
          "elements": [
              {
                  "type": "checkbox",
                  "name": "car",
                  "isRequired": true,
                  "title": "What cars have you being drived?",
                  "colCount": 4,
                  "choicesOrder": "asc",
                  "choices": [
                      "Ford",
                      "Vauxhall",
                      "Volkswagen",
                      "Nissan",
                      "Audi",
                      "Mercedes-Benz",
                      "BMW",
                      "Peugeot",
                      "Toyota",
                      "Citroen",
                      "Tesla"
                  ]
              }, {
                  "type": "ranking",
                  "name": "bestcar",
                  "isRequired": true,
                  "visibleIf": "{car.length} > 1",
                  "title": "What car did you enjoy the most?",
                  "choicesFromQuestion": "car",
                  "choicesFromQuestionMode": "selected"
              }
          ]
      }
  ]
};

var json = {
  "progressBarType": "buttons",
  "showProgressBar": "top",
  "pages": [
      {
          "navigationTitle": "Satisfaction",
          "navigationDescription": "Your feedback",
          "questions": [
              {
                  "type": "matrix",
                  "name": "Quality",
                  "title": "Please indicate if you agree or disagree with the following statements",
                  "columns": [
                      {
                          "value": 1,
                          "text": "Strongly Disagree"
                      }, {
                          "value": 2,
                          "text": "Disagree"
                      }, {
                          "value": 3,
                          "text": "Neutral"
                      }, {
                          "value": 4,
                          "text": "Agree"
                      }, {
                          "value": 5,
                          "text": "Strongly Agree"
                      }
                  ],
                  "rows": [
                      {
                          "value": "affordable",
                          "text": "Product is affordable"
                      }, {
                          "value": "does what it claims",
                          "text": "Product does what it claims"
                      }, {
                          "value": "better then others",
                          "text": "Product is better than other products on the market"
                      }, {
                          "value": "easy to use",
                          "text": "Product is easy to use"
                      }
                  ]
              }, {
                  "type": "rating",
                  "name": "satisfaction",
                  "title": "How satisfied are you with the Product?",
                  "isRequired": true,
                  "mininumRateDescription": "Not Satisfied",
                  "maximumRateDescription": "Completely satisfied"
              }, {
                  "type": "rating",
                  "name": "recommend friends",
                  "visibleIf": "{satisfaction} > 3",
                  "title": "How likely are you to recommend the Product to a friend or co-worker?",
                  "mininumRateDescription": "Will not recommend",
                  "maximumRateDescription": "I will recommend"
              }, {
                  "type": "comment",
                  "name": "suggestions",
                  "title": "What would make you more satisfied with the Product?"
              }
          ]
      }, {
          "navigationTitle": "Pricing",
          "navigationDescription": "Your opinion",
          "questions": [
              {
                  "type": "radiogroup",
                  "name": "price to competitors",
                  "title": "Compared to our competitors, do you feel the Product is",
                  "choices": ["Less expensive", "Priced about the same", "More expensive", "Not sure"]
              }, {
                  "type": "radiogroup",
                  "name": "price",
                  "title": "Do you feel our current price is merited by our product?",
                  "choices": ["correct|Yes, the price is about right", "low|No, the price is too low for your product", "high|No, the price is too high for your product"]
              }, {
                  "type": "multipletext",
                  "name": "pricelimit",
                  "title": "What is the... ",
                  "items": [
                      {
                          "name": "mostamount",
                          "title": "Most amount you would every pay for a product like ours"
                      }, {
                          "name": "leastamount",
                          "title": "The least amount you would feel comfortable paying"
                      }
                  ]
              }
          ]
      }, {
          "navigationTitle": "Contacts",
          "navigationDescription": "We're in touch",
          "questions": [
              {
                  "type": "text",
                  "name": "email",
                  "title": "Thank you for taking our survey. Your survey is almost complete, please enter your email address in the box below if you wish to participate in our drawing, then press the 'Submit' button."
              }
          ]
      }
  ]
};

const Poll = forwardRef((props, ref) => {
  return (
    <Draggable ref={ref}>
      <div className="poll">
        <Survey.Survey
          json={json} // 1 - 4 for examples
        />
      </div>
    </Draggable>
  )
});

export default Poll;