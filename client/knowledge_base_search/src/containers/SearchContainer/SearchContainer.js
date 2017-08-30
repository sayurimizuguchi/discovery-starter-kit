import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon, TextInput } from 'watson-react-components';
import ErrorContainer from '../ErrorContainer/ErrorContainer';
import QuestionBarContainer from '../QuestionBarContainer/QuestionBarContainer';
import QuestionTypeSelect from './QuestionTypeSelect';
import FeatureSelect from './FeatureSelect';
import './styles.css';

class SearchContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchInput: '',
      selectedQuestionType: QuestionTypeSelect.questionTypes.PRESET.value,
      selectedFeature: FeatureSelect.featureTypes.PASSAGES.value
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.searchInput !== this.state.searchInput) {
      this.setState({ searchInput: nextProps.searchInput });
    }
  }

  handleOnInput = (e) => {
    this.setState({ searchInput: e.target.value });
  }

  handleOnSubmit = (e) => {
    const input = this.state.searchInput;

    e.preventDefault();
    if (input && input.length > 0) {
      this.props.onSubmit(input);
    }
  }

  getViewAllButtonText() {
    const { presetQueries } = this.props;
    const numQuestions = presetQueries.length;
    const numZeroes = numQuestions.toString().length;
    const scale = Math.pow(10, numZeroes - 1);
    const numPresetQueries = Math.floor(numQuestions / scale) * scale;

    return `View all ${numPresetQueries.toLocaleString()}+ questions`;
  }

  handleOnQuestionTypeSelect = (e) => {
    this.setState({ selectedQuestionType: e.target.value });
  }

  handleOnFeatureSelect = (e) => {
    this.setState({ selectedFeature: e.target.value });
  }

  renderQuestionType() {
    const {
      isFetchingQuestions,
      errorMessage,
      offset,
      onOffsetUpdate,
      onQuestionClick,
      presetQueries,
      isFetchingResults,
      onViewAllClick
    } = this.props;

    switch (this.state.selectedQuestionType) {
      case QuestionTypeSelect.questionTypes.PRESET.value:
        return (
          <div>
          {
            isFetchingQuestions
              ? (
                  <div key='loader' className='_container _container_large _container-center'>
                    <Icon type='loader' size='large' />
                  </div>
                )
              : errorMessage
                ? (
                    <ErrorContainer errorMessage={errorMessage} />
                  )
                : (
                    <div>
                      <QuestionBarContainer
                        currentQuery={this.state.searchInput}
                        offset={offset}
                        onOffsetUpdate={onOffsetUpdate}
                        onQuestionClick={onQuestionClick}
                        presetQueries={presetQueries}
                        isFetchingResults={isFetchingResults}
                      />
                      <div className='view_all_button--div'>
                        <button
                          type='button'
                          className='view_all--button'
                          disabled={isFetchingResults}
                          onClick={onViewAllClick}
                        >
                          {this.getViewAllButtonText()}
                        </button>
                      </div>
                    </div>
                  )
          }
          </div>
        );
      case QuestionTypeSelect.questionTypes.CUSTOM.value:
        return (
          <div className='custom_question--div'>
            <span className='positioned--icon'>
              <Icon type='search' />
            </span>
            <TextInput
              id='searchInput'
              placeholder='Enter words, phrase, or a question about travel'
              value={this.state.searchInput}
              onInput={this.handleOnInput}
              style={{width: 'calc(100% - 3rem)'}}
              disabled={isFetchingResults}
            />
            <button
              className='white--button'
              disabled={isFetchingResults}
            >
              Find answers
            </button>
          </div>
        );
      default:
        return false;
    }
  }

  render() {
    return (
      <section
        className='_full-width-row search_container--section'
        ref={(section) => { this.searchSection = section }}
      >
        <div className='_container _container_large'>
          <form onSubmit={this.handleOnSubmit}>
            <FeatureSelect
              onFeatureSelect={this.handleOnFeatureSelect}
              selectedFeature={this.state.selectedFeature}
              questionTypeSelector={
                <QuestionTypeSelect
                  onSelect={this.handleOnQuestionTypeSelect}
                  selectedQuestion={this.state.selectedQuestionType}
                />
              }
            />
            { this.renderQuestionType() }
          </form>
        </div>
      </section>
    );
  }
}

SearchContainer.PropTypes = {
  errorMessage: PropTypes.string,
  isFetchingQuestions: PropTypes.bool.isRequired,
  isFetchingResults: PropTypes.bool.isRequired,
  offset: PropTypes.number.isRequired,
  onOffsetUpdate: PropTypes.func.isRequired,
  onQuestionClick: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onViewAllClick: PropTypes.func.isRequired,
  presetQueries: PropTypes.arrayOf(PropTypes.string).isRequired,
  searchInput: PropTypes.string.isRequired
}

export default SearchContainer;
