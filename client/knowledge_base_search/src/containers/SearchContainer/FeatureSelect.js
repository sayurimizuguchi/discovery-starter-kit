import React, { Component } from 'react';
import { string, func, element } from 'prop-types'
import classNames from 'classnames';
import './styles.css';

class FeatureSelect extends Component {
  // a map of the features shown in this starter kit
  static featureTypes = {
    // Passage search - finds relevant passages across all documents
    PASSAGES: {
      value: 'passages',
      text: 'Passage Search'
    },
    // Relevancy training - uses user-input training data to improve relevancy
    RELEVANCY: {
      value: 'relevancy',
      text: 'Relevancy'
    }
  }

  isSelected(feature) {
    return this.props.selectedFeature === feature.value;
  }

  render() {
    const {
      onFeatureSelect,
      questionTypeSelector
    } = this.props;

    return (
      <ul className="feature_select--list">
        <li className="feature_select--list_item">
          { questionTypeSelector }
        </li>
        {
          Object.values(FeatureSelect.featureTypes).map((feature) => {
            return (
              <li key={feature.value} className="feature_select--list_item">
                <button
                  type="button"
                  value={feature.value}
                  className={
                    classNames('feature_select--list_button', {
                      'feature_select--list_button--active': this.isSelected(feature)
                    })
                  }
                  onClick={onFeatureSelect}
                >
                  { feature.text }
                </button>
              </li>
            )
          })
        }
      </ul>
    );
  }
}

FeatureSelect.propTypes = {
  onFeatureSelect: func.isRequired,
  selectedFeature: string.isRequired,
  questionTypeSelector: element.isRequired,
};

export default FeatureSelect;
