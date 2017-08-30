import React, { Component } from 'react';
import { string, func } from 'prop-types';
import './styles.css';

class QuestionTypeSelect extends Component {
  // a map of the questions used per feature type
  static questionTypes = {
    // select "PRESET" when you wish to have questions from the dataset
    // this uses the /api/questions endpoint on the server
    PRESET: {
      value: 'preset',
      text: 'Preset questions'
    },
    // select "CUSTOM" when you wish to type in your own question
    CUSTOM: {
      value: 'custom',
      text: 'Custom questions'
    }
  }

  render() {
    return (
      <select
        className="question_type--select"
        value={this.props.selectedQuestion}
        onChange={this.props.onSelect}
      >
        {
          Object.values(QuestionTypeSelect.questionTypes).map((question) => {
            return (
              <option key={question.value} value={question.value}>
                { question.text }
              </option>
            )
          })
        }
      </select>
    );
  }
}

QuestionTypeSelect.propTypes = {
  onSelect: func.isRequired,
  selectedQuestion: string.isRequired,
};

export default QuestionTypeSelect;
