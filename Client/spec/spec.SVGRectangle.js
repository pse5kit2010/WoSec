
svgUtility = WoSec.svgUtility

describe("SVGUtility", function(){
	describe("SVGRectangle", function() {
		describe("creation", function() {
			it("should use filter from jQuery", function() {
				expect(jQueryMockUp).to(receive, "filter", "twice");
				svgUtility.getTaskRectangle("someID");
			});
		});
		describe("method", function() {
			before_each(function() {
				rectangle = svgUtility.getTaskRectangle("someID");
			});
			describe("highlight", function() {
				it("should use effect from jQuery", function() {
					expect(jQueryMockUp).to(receive, "effect");
					rectangle.highlight();
				});
			});
			describe("markObtrusive", function() {
                it("should use attr from jQuery", function() {
	                expect(jQueryMockUp).to(receive, "attr");
					rectangle.markObtrusive();
                });
            });
            describe("markUnobtrusive", function() {
                it("should use attr from jQuery", function() {
	                expect(jQueryMockUp).to(receive, "attr");
	                rectangle.markObtrusive();
                });
            });
            describe("reset", function() {
                it("should use attr from jQuery", function() {
	                expect(jQueryMockUp).to(receive, "attr");
	                rectangle.reset();
                });
            });
            describe("registerOnClick", function() {
                it("should use click from jQuery", function() {
                    expect(jQueryMockUp).to(receive, "click", "twice");
                    rectangle.registerOnClick();
                });
            });
            describe("registerOnHover", function() {
                it("should use hover from jQuery", function() {
                    expect(jQueryMockUp).to(receive, "hover", "twice");
                    rectangle.registerOnHover();
                });
            });
		});
	});
});
