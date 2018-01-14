import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  selectSubreddit,
  fetchPostsIfNeeded,
  invalidateSubreddit,
  selectSize
} from '../actions'
import Picker from '../components/Picker'
import Posts from '../components/Posts'
import SizePicker from '../components/SizePicker'

class AsyncApp extends Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleRefreshClick = this.handleRefreshClick.bind(this)
    this.handleSelectedSizeChange = this.handleSelectedSizeChange.bind(this);
  }

  componentDidMount() {
    const { dispatch, selectedSubreddit, selectedSize } = this.props
    dispatch(fetchPostsIfNeeded(selectedSubreddit, selectedSize))
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedSubreddit !== prevProps.selectedSubreddit) {
      const { dispatch, selectedSubreddit, selectedSize } = this.props
      dispatch(fetchPostsIfNeeded(selectedSubreddit, selectedSize))
    }
  }

  handleChange(nextSubreddit) {
    const { selectedSize } = this.props
    this.props.dispatch(selectSubreddit(nextSubreddit))
    this.props.dispatch(fetchPostsIfNeeded(nextSubreddit, selectedSize))
  }

  handleRefreshClick(e) {
    e.preventDefault()

    const { dispatch, selectedSubreddit, selectedSize } = this.props
    dispatch(invalidateSubreddit(selectedSubreddit))
    dispatch(fetchPostsIfNeeded(selectedSubreddit, selectedSize))
  }

  handleSelectedSizeChange(nextSelectedSize) {
    const { selectedSubreddit } = this.props
    this.props.dispatch(selectSize(nextSelectedSize))
    this.props.dispatch(fetchPostsIfNeeded(selectedSubreddit, nextSelectedSize))
  }

  render() {
    const { selectedSubreddit, selectedSize, posts, isFetching, lastUpdated } = this.props
    return (
      <div>
        <div style={{display: 'inline-block', marginLeft: 20, width: 100}}>
          <Picker
            value={selectedSubreddit}
            onChange={this.handleChange}
            options={['bitcoin', 'frontend', 'vuejs']}
          />
        </div>
        <div style={{display: 'inline-block', marginLeft: 50, width: 200}}>
          <SizePicker
            value={selectedSize}
            onChange={this.handleSelectedSizeChange}
            options={[5, 10, 15, 20]}
          />
        </div>
        <p>
          {lastUpdated &&
            <span>
              Last updated at {new Date(lastUpdated).toLocaleTimeString()}.
              {' '}
            </span>}
          {!isFetching &&
            <a href="#" onClick={this.handleRefreshClick}>
              Refresh
            </a>}
        </p>
        {isFetching && posts.length === 0 && <h2>Loading...</h2>}
        {!isFetching && posts.length === 0 && <h2>Empty.</h2>}
        {posts.length > 0 &&
          <div style={{ opacity: isFetching ? 0.5 : 1 }}>
            <Posts posts={posts} />
          </div>}
      </div>
    )
  }
}

AsyncApp.propTypes = {
  selectedSubreddit: PropTypes.string.isRequired,
  selectedSize: PropTypes.number.isRequired,
  posts: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { selectedSubreddit, postsBySubreddit, selectedSize } = state
  const {
    isFetching,
    lastUpdated,
    items: posts
  } = postsBySubreddit[selectedSubreddit] || {
      isFetching: true,
      items: []
    }

  return {
    selectedSubreddit,
    selectedSize,
    posts,
    isFetching,
    lastUpdated
  }
}

export default connect(mapStateToProps)(AsyncApp)