import React, { Component } from 'react';
import { connect } from 'react-redux';

class SplitPaneView extends Component {
  constructor(props) {
    super();
    this.firstFolio = props.document.folios[0];

    // Initialize the splitter
    this.rightPaneMinWidth = 200;
    this.leftPaneMinWidth = 200;
    this.splitFraction = 0.5;
    this.dividerWidth = 16;
    const whole = window.innerWidth;
    const leftW = whole / 2;

    const split_left = (leftW / whole);
    const split_right = 1 - split_left;
    this.state = {
      style: {
        gridTemplateColumns: `${split_left}fr ${this.dividerWidth}px ${split_right}fr`,
      },
    };

    // event handlers
    this.dragging = false;
    this.onDrag = this.onDrag.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onEndDrag = this.onEndDrag.bind(this);
    this.updatePaneSize = this.updatePaneSize.bind(this);
    this.updatePaneSize = this.updatePaneSize.bind(this);
  }

  // On drag, update the UI continuously
  onDrag = (e) => {
    if (this.dragging) {
      const whole = window.innerWidth - this.dividerWidth;
      const left_viewWidth = e.clientX - this.dividerWidth / 2;
      const right_viewWidth = whole - left_viewWidth;

      // Update as long as we're within limits
      if (left_viewWidth > this.leftPaneMinWidth
        && right_viewWidth > this.rightPaneMinWidth) {
        this.splitFraction = (whole === 0) ? 0.0 : left_viewWidth / whole;
        this.updateUI();
      }

      this.updatePaneSize();
    }
  };

  // Drag start: mark it
  onStartDrag = (e) => {
    this.dragging = true;
  };

  // Drag end
  onEndDrag = (e) => {
    this.dragging = false;
  };

  // On window resize
  onResize = (e) => {
    this.updatePaneSize();
  };

  // Update the screen with the new split info
  updateUI() {
    const left = this.splitFraction;
    const right = 1.0 - left;
    this.setState({
      ...this.state,
      style: {
        ...this.state.style,
        gridTemplateColumns: `${left}fr ${this.dividerWidth}px ${right}fr`,
      },
    });
  }

  // Update the sizes of the panes
  updatePaneSize() {
    // Record state change
    const left_px = Math.floor(Math.abs(window.innerWidth * this.splitFraction));
    const right_px = Math.floor(window.innerWidth * (1.0 - this.splitFraction));
    if (this.props.onWidth && left_px >= this.leftPaneMinWidth) {
      this.props.onWidth(left_px, right_px);
    }
  }

  componentDidMount() {
    this.updateUI();
    window.addEventListener('mousemove', this.onDrag);
    window.addEventListener('mouseup', this.onEndDrag);
    window.addEventListener('resize', this.onResize);

    // Set the default width on mount
    if (this.props.onWidth) {
      const left_px = Math.floor(Math.abs(window.innerWidth * this.splitFraction));
      const right_px = Math.floor(window.innerWidth * (1.0 - this.splitFraction));
      this.props.onWidth(left_px, right_px);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('mouseup', this.onEndDrag);
    window.removeEventListener('resize', this.onResize);
  }

  renderDivider() {
    const drawerIconClass = 'drawer-icon fas fa-caret-left fa-2x';

    return (
      <div className="divider" onMouseDown={this.onStartDrag}>
        <div className="drawer-button hidden" onClick={this.onDrawerButton}>
          <i className={drawerIconClass}> </i>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="split-pane-view" style={{ ...this.state.style }}>
        { this.props.leftPane }
        { this.renderDivider() }
        { this.props.rightPane }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    document: state.document,
  };
}
export default connect(mapStateToProps)(SplitPaneView);
