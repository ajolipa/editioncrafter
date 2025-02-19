import React from 'react';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroller';

class ImageGridView extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.generateThumbs = this.generateThumbs.bind(this);
    this.loadIncrement = 10;
    this.state = {
      jumpToBuffer: '',
      thumbs: '',
      visibleThumbs: [],
    };
  }

  componentDidUpdate(prevProps) {
    const { documentView } = this.props;
    const folioID = documentView[this.props.side].iiifShortID;
    const nextFolioID = this.props.documentView[this.props.side].iiifShortID;

    if (folioID !== nextFolioID) {
      const thumbs = this.generateThumbs(nextFolioID, this.props.document.folios);
      const thumbCount = (thumbs.length > this.loadIncrement) ? this.loadIncrement : thumbs.length;
      const visibleThumbs = thumbs.slice(0, thumbCount);
      this.setState({ thumbs, visibleThumbs });
    }
  }

  onJumpToChange = (event) => {
    const jumpToBuffer = event.target.value;
    this.setState({ ...this.state, jumpToBuffer });
  };

  onJumpTo = (event) => {
    const { jumpToBuffer } = this.state;
    const { side, document, documentViewActions } = this.props;
    event.preventDefault();

    // Convert folioName to ID (and confirm it exists)
    if (document.folioByName[jumpToBuffer]) {
      const folio = document.folioByName[jumpToBuffer];
      if (folio) {
        documentViewActions.changeCurrentFolio(folio.id, side);
      }
    }

    this.setState({ ...this.state, jumpToBuffer: '' });
  };

  renderToolbar() {
    return (
      <div className="imageGridToolbar">
        <div className="jump-to">
          <form onSubmit={this.onJumpTo}>
            <span>Jump to: </span>
            <input
              id="jump-to-input"
              placeholder="Page Name (e.g. '3r')"
              onChange={this.onJumpToChange}
              value={this.state.jumpToBuffer}
            />
            <button id="jump-to-button" onClick={this.onJumpTo}>
              <span style={{ color: 'black' }} className="fa fa-hand-point-right" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  componentDidMount() {
    const { documentView } = this.props;
    const folioID = documentView[this.props.side].iiifShortID;
    const thumbs = this.generateThumbs(folioID, this.props.document.folios);
    const thumbCount = (thumbs.length > this.loadIncrement) ? this.loadIncrement : thumbs.length;
    const visibleThumbs = thumbs.slice(0, thumbCount);
    this.setState({ thumbs, visibleThumbs });
  }

  onClickThumb = (id, e) => {
    // Set the folio for this side
    this.props.documentViewActions.changeCurrentFolio(
      id,
      this.props.side,
    );
  };

  generateThumbs(currentID, folios) {
    const thumbs = folios.map((folio, index) => (
      <li key={`thumb-${index}`} className="thumbnail">
        <figure className={(folio.id === currentID) ? 'current' : ''}><a id={folio.id} onClick={this.onClickThumb.bind(this, folio.id)}><img src={folio.image_thumbnail_url} alt={folio.name} /></a></figure>
        <figcaption className={(folio.id === currentID) ? 'thumbnail-caption current' : 'thumbnail-caption'}>
          {(folio.id === currentID) ? (`*${folio.name}`) : folio.name}
        </figcaption>

      </li>
    ));
    return thumbs;
  }

  moreThumbs = () => {
    const { thumbs } = this.state;
    let { visibleThumbs } = this.state;
    const thumbCount = visibleThumbs.length + this.loadIncrement;

    if (thumbs.length >= thumbCount) {
      visibleThumbs = thumbs.slice(0, thumbCount);
    } else {
      visibleThumbs = thumbs;
    }

    this.setState({ visibleThumbs });
  };

  hasMore() {
    return (this.state.visibleThumbs.length !== this.state.thumbs.length);
  }

  render() {
    let thisClass = 'imageGridComponent';
    thisClass = `${thisClass} ${this.props.side}`;
    let { visibleThumbs } = this.state;
    if (visibleThumbs.constructor.toString().indexOf('Array') === -1) {
      visibleThumbs = [];
    }
    return (
      <div className={thisClass}>
        { this.renderToolbar() }
        <InfiniteScroll
          element="ul"
          loadMore={this.moreThumbs}
          hasMore={this.hasMore()}
          useWindow={false}
        >
          {visibleThumbs}
        </InfiniteScroll>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    document: state.document,
  };
}

export default connect(mapStateToProps)(ImageGridView);
