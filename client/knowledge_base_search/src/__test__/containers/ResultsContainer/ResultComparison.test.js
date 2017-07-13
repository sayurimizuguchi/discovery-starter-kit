import React from 'react';
import ReactDOM from 'react-dom';
import ResultComparison from '../../../containers/ResultsContainer/ResultComparison';
import ResultBox from '../../../containers/ResultsContainer/ResultBox';
import { shallow } from 'enzyme';

describe('<ResultComparison />', () => {
  let wrapper;
  const onSetFullResultMock = jest.fn();
  const props = {
    result: {
      answer: 'a good answer'
    },
    passage: {
      passage_text: 'a passage'
    },
    passageFullResult: {
      answer: 'a passage full answer'
    },
    index: 0,
    onSetFullResult: onSetFullResultMock,
    full_result_index: -1,
    full_result_type: null
  }

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<ResultComparison {...props} />, div);
  });

  it('has 2 <ResultBox /> with expected text', () => {
    wrapper = shallow(<ResultComparison {...props} />);

    const resultBoxes = wrapper.find(ResultBox);
    expect(resultBoxes).toHaveLength(2);
    expect(resultBoxes.at(0).props().result_text).toEqual('a good answer');
    expect(resultBoxes.at(1).props().result_text).toEqual('a passage…');
  });

  it('has 2 titles', () => {
    wrapper = shallow(<ResultComparison {...props} />);

    const titles = wrapper.find('.results_comparison_content--div h5');

    expect(titles).toHaveLength(2);
    expect(titles.at(0).text()).toEqual('Standard search');
    expect(titles.at(1).text()).toEqual('Passage search');
  });

  describe('when passage is not present', () => {
    beforeEach(() => {
      const props_with_no_passage = Object.assign({}, props, {
        passage: null
      });

      wrapper = shallow(<ResultComparison {...props_with_no_passage} />);
    });

    it('passes null to the passage <ResultBox />', () => {
      const resultBoxes = wrapper.find(ResultBox);

      expect(resultBoxes.at(1).props().result_text).toEqual(null);
    });
  });

  describe('when the passageFullResult is the same as the passage', () => {
    const props_with_same_passage = Object.assign({}, props, {
      passageFullResult: {
        answer: 'a passage'
      }
    });

    beforeEach(() => {
      wrapper = shallow(<ResultComparison {...props_with_same_passage} />);
    });

    it('does not ellipsize the passage', () => {
      expect(wrapper.find(ResultBox).at(1).props().result_text)
        .toEqual('a passage');
    });
  });

  describe('when the passageFullResult is longer than the passage', () => {
    describe('and the passageFullResult starts with the passage', () => {
      const props_with_start_passage = Object.assign({}, props, {
        passageFullResult: {
          answer: 'a passage starts this answer'
        }
      });

      beforeEach(() => {
        wrapper = shallow(<ResultComparison {...props_with_start_passage} />);
      });

      it('ellipsizes the end of the passage', () => {
        expect(wrapper.find(ResultBox).at(1).props().result_text)
          .toEqual('a passage…');
      });
    });

    describe('and the passageFullResult ends with the passage', () => {
      const props_with_end_passage = Object.assign({}, props, {
        passageFullResult: {
          answer: 'ends with a passage'
        }
      });

      beforeEach(() => {
        wrapper = shallow(<ResultComparison {...props_with_end_passage} />);
      });

      it('ellipsizes the start of the passage', () => {
        expect(wrapper.find(ResultBox).at(1).props().result_text)
          .toEqual('…a passage');
      });
    });

    describe('and the passageFullResult has the passage in the middle', () => {
      const props_with_middle_passage = Object.assign({}, props, {
        passageFullResult: {
          answer: 'has a passage in the middle'
        }
      });

      beforeEach(() => {
        wrapper = shallow(<ResultComparison {...props_with_middle_passage} />);
      });

      it('ellipsizes both the start and end of the passage', () => {
        expect(wrapper.find(ResultBox).at(1).props().result_text)
          .toEqual('…a passage…');
      });
    });
  });

  describe('when index is not 0', () => {
    beforeEach(() => {
      const props_with_nonzero_index = Object.assign({}, props, {
        index: 1
      });

      wrapper = shallow(<ResultComparison {...props_with_nonzero_index} />);
    });

    it('does not show titles', () => {
      const titles = wrapper.find('.results_comparison_header--div h4');

      expect(titles).toHaveLength(0);
      expect(wrapper.text()).not.toContain('Standard Search');
      expect(wrapper.text()).not.toContain('Passage Search');
    });
  });

  describe('when full_result_index is equal to index', () => {
    let wrapper;

    beforeEach(() => {
      const props_with_equal_index = Object.assign({}, props, {
        full_result_index: props.index,
        full_result_type: 'regular'
      });

      wrapper = shallow(<ResultComparison {...props_with_equal_index} />);
    });

    it('has the first <ResultBox /> is_full_result_shown = true', () => {
      const resultBoxes = wrapper.find(ResultBox);

      expect(resultBoxes.at(0).props().is_full_result_shown).toBe(true);
      expect(resultBoxes.at(1).props().is_full_result_shown).toBe(false);
    });

    describe('and full_result_type is "passage"', () => {
      const props_with_passage_type = Object.assign({}, props, {
        full_result_index: props.index,
        full_result_type: 'passage'
      });

      beforeEach(() => {
        wrapper = shallow(<ResultComparison {...props_with_passage_type} />);
      });

      it('has the second <ResultBox /> is_full_result_shown = true', () => {
        const resultBoxes = wrapper.find(ResultBox);

        expect(resultBoxes.at(0).props().is_full_result_shown).toBe(false);
        expect(resultBoxes.at(1).props().is_full_result_shown).toBe(true);
      });

      describe('and the passage_text is not found in the full answer', () => {
        const props_with_different_passage = Object.assign({}, props_with_passage_type, {
          passageFullResult: {
            answer: 'a great answer'
          }
        });

        beforeEach(() => {
          wrapper = shallow(<ResultComparison {...props_with_different_passage} />);
        });

        it('has the only full passage answer shown', () => {
          const resultBoxes = wrapper.find(ResultBox);

          expect(resultBoxes.at(1).props().result_text).toEqual('a great answer');
        });
      });

      describe('and the passage_text is found in the full answer', () => {
        beforeEach(() => {
          wrapper = shallow(<ResultComparison {...props_with_passage_type} />);
        });

        it('has the passage text bolded in the full answer', () => {
          const resultBoxes = wrapper.find(ResultBox);
          const expected = (<span>{''}<b>a passage</b> full answer</span>);

          expect(resultBoxes.at(1).props().result_text).toEqual(expected);
        });
      });

      describe('and there is no passageFullResult', () => {
        const props_with_no_passage = Object.assign({}, props_with_passage_type, {
          passageFullResult: null
        });

        beforeEach(() => {
          wrapper = shallow(<ResultComparison {...props_with_no_passage} />);
        });

        it('passes null to the passage <ResultBox />', () => {
          const resultBoxes = wrapper.find(ResultBox);

          expect(resultBoxes.at(1).props().result_text).toEqual(null);
        });

        describe('and there is no passage_text', () => {
          const props_with_no_passage_text = Object.assign({}, props_with_no_passage, {
            passage: null
          });

          beforeEach(() => {
            wrapper = shallow(<ResultComparison {...props_with_no_passage_text} />);
          });

          it('passes null to the passage <ResultBox />', () => {
            const resultBoxes = wrapper.find(ResultBox);

            expect(resultBoxes.at(1).props().result_text).toEqual(null);
          });
        });
      });
    });
  });

  describe('when a full result is being shown', () => {
    let wrapper;
    const props_with_full_result = Object.assign({}, props, {
      full_result_index: 0,
      full_result_type: 'passage'
    });

    beforeEach(() => {
      wrapper = shallow(<ResultComparison {...props_with_full_result} />);
    });

    describe('and toggleFullResult is called with equal index and type', () => {
      beforeEach(() => {
        wrapper.instance().toggleFullResult(
          props_with_full_result.full_result_index,
          props_with_full_result.full_result_type
        )
      });

      it('calls onSetFullResult with -1 and null', () => {
        expect(onSetFullResultMock).toBeCalledWith(-1, null);
      });
    });

    describe('and toggleFullResult is called with a different index', () => {
      const my_index = 1;
      const expected_type = props_with_full_result.full_result_type;

      beforeEach(() => {
        wrapper.instance().toggleFullResult(
          my_index,
          props_with_full_result.full_result_type
        )
      });

      it('calls onSetFullResult with parameters', () => {
        expect(onSetFullResultMock).toBeCalledWith(my_index, expected_type);
      });
    });

    describe('and toggleFullResult is called with a different type', () => {
      const expected_index = props_with_full_result.full_result_index;
      const my_type = 'regular';

      beforeEach(() => {
        wrapper.instance().toggleFullResult(
          props_with_full_result.full_result_index,
          my_type
        )
      });

      it('calls onSetFullResult with parameters', () => {
        expect(onSetFullResultMock).toBeCalledWith(expected_index, my_type);
      });
    });
  });
});
