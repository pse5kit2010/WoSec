
htmlRenderer = WoSec.htmlRenderer
svgUtility = WoSec.svgUtility


describe("HTMLRenderer", function() {
	describe("Infobox", function() {
		describe("creation", function() {
			it("should clone and append with jQuery", function() {
				expect(jQueryMockUp).to(receive, "clone")
				expect(jQueryMockUp).to(receive, "appendTo")
				htmlRenderer.createInfobox()
			});
		});
		describe("method", function() {
			before_each(function() {
				infobox = htmlRenderer.createInfobox()
			});
			describe("hide", function() {
				it("should hide with jQuery", function() {
					expect(jQueryMockUp).to(receive, "hide")
					infobox.hide()
				});
			});
			describe("show", function(){
				it("should show with jQuery", function() {
	                expect(jQueryMockUp).to(receive, "show")
	                infobox.show()
				});
			});
			describe("setContent", function() {
				it("should use find twice, text three times and clone and appendTo on jQuery", function() {
					// setParticipant: find+text
					// setData: find+text
					// databox: clone+appendTo+text
					expect(jQueryMockUp).to(receive, "find", "twice")
					expect(jQueryMockUp).to(receive, "text", 3)
					expect(jQueryMockUp).to(receive, "clone")
					expect(jQueryMockUp).to(receive, "appendTo")
					infobox.setContent({
						participant: {
							name: "Alice"
						},
						data: "xaxaxaxaxaxaxaxaaxaxa"
					})
				})
			});
			describe("bindToSVGRectangle", function() {
				it("should use css twice and click on jQuery and registerOnHover on the rectangle", function() {
					expect(jQueryMockUp).to(receive, "css", "twice");
					expect(jQueryMockUp).to(receive, "click");
					rectangle = svgUtility.getTaskRectangle("someID");
					expect(rectangle).to(receive, "registerOnHover");
					infobox.bindToSVGRectangle(rectangle);
				});
			});
		});
	});
});
