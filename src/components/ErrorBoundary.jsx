/* eslint-disable react/prop-types */
import { Component } from 'react';

/*
  Backstop for a heavy WebGL scene: if its subtree throws during render (e.g. a
  model fails to load), show a quiet retry affordance instead of a blank screen
  that breaks the whole page. (Silent context-loss is handled separately by
  useWebGLRecovery — this catches actual thrown errors.)
*/
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('Scene error caught by boundary:', error);
  }

  retry = () => this.setState({ failed: false });

  render() {
    if (this.state.failed) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="absolute inset-0 grid place-items-center pointer-events-auto">
          <button
            onClick={this.retry}
            className="px-5 py-2.5 font-mono text-[11px] tracking-[3px] text-neon border border-neon/40 hover:bg-neon/10 transition-colors"
          >
            ⟳ RELOAD SCENE
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
