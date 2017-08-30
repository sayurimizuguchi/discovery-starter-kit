import React, { Component } from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import Sticky from 'react-stickynode';
import { Header, Jumbotron, Footer, Icon } from 'watson-react-components';
import SearchContainer from './containers/SearchContainer/SearchContainer';
import FeatureSelect from './containers/SearchContainer/FeatureSelect';
import QuestionBarContainer from './containers/QuestionBarContainer/QuestionBarContainer';
import PassagesContainer from './containers/PassagesContainer/PassagesContainer';
import ErrorContainer from './containers/ErrorContainer/ErrorContainer';
import ViewAllContainer from './containers/ViewAllContainer/ViewAllContainer';
import links from './utils/links';
import query from './actions/query';
import questions from './actions/questions';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetchingQuestions: true,
      fetchingResults: false,
      resultsFetched: false,
      enriched_results: [],
      search_input: '',
      results_error: null,
      questionsError: null,
      searchContainerHeight: 0,
      showViewAll: false,
      presetQueries: [],
      offset: 0,
      selectedFeature: FeatureSelect.featureTypes.PASSAGES.value
    }
  }

  componentDidMount() {
    questions(this.state.selectedFeature).then((response) => {
      if (response.error) {
        this.setState({
          questionsError: response.error,
          fetchingQuestions: false
        });
      } else {
        this.setState({
          presetQueries: this.shuffleQuestions(response),
          fetchingQuestions: false
        });
      }
    });
  }

  componentWillUpdate(nextProps, nextState) {
    const searchContainer = this.searchContainer;
    if (searchContainer) {
      nextState.searchContainerHeight = searchContainer
        .searchSection.getBoundingClientRect().height
    }
  }

  handleSearch = (input) => {
    this.setState({
      fetchingResults: true,
      search_input: input,
      results_error: null
    });

    query('enriched', {natural_language_query: input})
      .then((enriched_response) => {
        if (enriched_response.passages) {
          return this.retrieveMissingPassages(enriched_response)
            .then((response) => {
              return response;
            });
        } else {
          return Promise.resolve(enriched_response);
        }
      }).then((enriched_response_with_passages) => {
        if (enriched_response_with_passages.error) {
          this.setState({
            fetchingResults: false,
            resultsFetched: true,
            results_error: enriched_response_with_passages.error
          });
        } else {
          this.setState({
            fetchingResults: false,
            resultsFetched: true,
            enriched_results: enriched_response_with_passages
          });
        }
      });
  }

  retrieveMissingPassages(enriched_results) {
    const uniqueDocumentIds = enriched_results.passages.reduce(
      (uniqueVals, passage) => {
        if (uniqueVals.indexOf(passage.document_id) === -1) {
          uniqueVals.push(passage.document_id);
        }
        return uniqueVals;
      }, []);

    let missingDocumentIds = [];
    uniqueDocumentIds.forEach((document_id) => {
      let enriched_result = enriched_results.results.find((result) => {
        return result.id === document_id;
      });

      if (!enriched_result) {
        missingDocumentIds.push(document_id);
      }
    });

    return missingDocumentIds.length > 0
      ? query('enriched', {filter: `id:(${missingDocumentIds.join('|')})`})
          .then((response) => {
            if (response.error) {
              this.setState({results_error: response.error});
            }

            if (response.results) {
              let newResults = enriched_results.results.concat(response.results);
              enriched_results.results = newResults;
            }

            return enriched_results;
          })
      : Promise.resolve(enriched_results);
  }

  shuffleQuestions(questions) {
    const allQuestions = questions.slice(0);
    let shuffledQueries = [];

    for (let i = 0; i < questions.length; i++) {
      let questionIndex = Math.floor(Math.random() * allQuestions.length);
      shuffledQueries.push(allQuestions.splice(questionIndex, 1)[0]);
    }

    return shuffledQueries;
  }

  handleQuestionClick = (query) => {
    const { presetQueries, offset } = this.state;
    const questionIndex = presetQueries.findIndex((presetQuery) => {
      return presetQuery.question === query;
    });
    const beginQuestions = offset;
    const endQuestions = offset + QuestionBarContainer.defaultProps.questionsShown - 1;
    let newPresetQueries = presetQueries.slice(0);
    let newOffset = offset;

    if (questionIndex < beginQuestions || questionIndex > endQuestions) {
      newPresetQueries.splice(questionIndex, 1);
      newPresetQueries.unshift({question: query});
      newOffset = 0;
    }

    this.setState({
      showViewAll: false,
      search_input: query,
      presetQueries: newPresetQueries,
      offset: newOffset
    })
    this.handleSearch(query);
  }

  handleQuestionFetch = (e) => {
    const selectedFeature = e.target.value;
    questions(selectedFeature).then((response) => {
      if (response.error) {
        this.setState({
          questionsError: response.error,
          fetchingQuestions: false
        });
      } else {
        this.setState({
          presetQueries: this.shuffleQuestions(response),
          fetchingQuestions: false,
          selectedFeature
        });
      }
    });
  }

  handleOffsetUpdate = (offset) => {
    this.setState({ offset: offset });
  }

  toggleViewAll = () => {
    this.setState({ showViewAll: !this.state.showViewAll });
  }

  render() {
    return (
      <div className='App'>
        <Header
          mainBreadcrumbs='Starter Kits'
          mainBreadcrumbsUrl={links.starter_kits}
          subBreadcrumbs='Knowledge Base Search'
          subBreadcrumbsUrl='/'
        />
        <Jumbotron
          serviceName='Discovery - Knowledge Base Search'
          repository={links.repository}
          documentation={links.doc_homepage}
          apiReference={links.doc_api}
          startInBluemix={links.bluemix}
          version='GA'
          description='This starter kit demonstrates how Watson Discovery&#39;s Passage Search quickly finds the most relevant information in your documents to answer your natural language questions. Try out the preset questions or enter a custom question and compare the answers returned by a Standard (non-Passage) Search vs. a Passage Search on the Stack Exchange Travel data set.'
        />
        <Sticky>
          <SearchContainer
            ref={(container) => { this.searchContainer = container }}
            errorMessage={this.state.questionsError}
            isFetchingQuestions={this.state.fetchingQuestions}
            isFetchingResults={this.state.fetchingResults}
            offset={this.state.offset}
            onFeatureSelect={this.handleQuestionFetch}
            onOffsetUpdate={this.handleOffsetUpdate}
            onQuestionClick={this.handleQuestionClick}
            onSubmit={this.handleSearch}
            onViewAllClick={this.toggleViewAll}
            presetQueries={this.state.presetQueries}
            searchInput={this.state.search_input}
            selectedFeature={this.state.selectedFeature}
          />
        </Sticky>
        <CSSTransitionGroup
          transitionName='view_all_overlay'
          transitionEnterTimeout={230}
          transitionLeaveTimeout={230}
        >
          {
            this.state.showViewAll &&
            (
              <div
                className='view_all_overlay--div'
                onClick={this.toggleViewAll}
              />
            )
          }
        </CSSTransitionGroup>
        <CSSTransitionGroup
          transitionName='view_all'
          transitionEnterTimeout={230}
          transitionLeaveTimeout={230}
        >
          {
            this.state.showViewAll &&
            (
              <ViewAllContainer
                key='view_all'
                onQuestionClick={this.handleQuestionClick}
                onCloseClick={this.toggleViewAll}
                isFetchingResults={this.state.fetchingResults}
                presetQueries={this.state.presetQueries}
              />
            )
          }
        </CSSTransitionGroup>
        <CSSTransitionGroup
          transitionName='results'
          transitionEnterTimeout={500}
          transitionLeave={false}
        >
          { this.state.fetchingResults || this.state.resultsFetched
              ? (
                  <section key='results' className='_full-width-row results_row--section'>
                    {
                      this.state.fetchingResults
                        ? (
                            <div key='loader' className='_container _container_large _container-center'>
                              <Icon type='loader' size='large' />
                            </div>
                          )
                        : this.state.resultsFetched
                          ? this.state.results_error
                            ? (
                                <ErrorContainer
                                  key='error_container'
                                  errorMessage={this.state.results_error}
                                />
                              )
                            : (
                                <PassagesContainer
                                  key='results_container'
                                  enriched_results={this.state.enriched_results}
                                  onSearch={this.handleSearch}
                                  searchContainerHeight={this.state.searchContainerHeight}
                                />
                              )
                          : null
                    }
                  </section>
                )
              : null
          }
        </CSSTransitionGroup>
        <section className='_full-width-row license--section'>
          <a
            href={links.stack_exchange}
            className={'base--a'}
          >
            Stack Exchange
          </a>
          <span> user contributions are licensed under </span>
          <a
            href={links.cc_license}
            className={'base--a'}
          >
            cc by-sa 3.0 with attribution required
          </a>
        </section>
        <Footer />
      </div>
    );
  }
}

export default App;
