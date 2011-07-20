
EventCommand = WoSec.EventCommand;
newTask = WoSec.newTask;
newTaskLane = WoSec.newTaskLane;
svgUtility = WoSec.svgUtility;
htmlRenderer = WoSec.htmlRenderer;

describe("EventCommands", function() {
	describe("EventCommand abstract class", function() {
		describe("method getTimestamp", function() {
			it("should return a stored timestamp", function() {
				anEventCommand = new EventCommand(123456789);
				expect(anEventCommand.getTimestamp()).to(be, 123456789);
			});
		});
		describe("static method create", function() {
			it("should return a new EventCommand", function() {
				expect(EventCommand.create({timestamp: 123456789})).to(be_an_instance_of, EventCommand);
			});
		});
	});
	before_each(function() {
		task = newTask(htmlRenderer.createInfobox(), svgUtility.getTaskRectangle("someID"), "anotherID")
		stub(WoSec.workflow, "getTaskByID").and_return(task)
	})
	describe("HighlightingEvent", function() {
		before_each(function() {
			aHighlightingEvent = new EventCommand.Highlighting(task, 123456789);
		});
		describe("inheritance", function() {
			it("should inherit from EventCommand", function() {
				expect(aHighlightingEvent).to(be_an_instance_of, EventCommand);
			});
			it("should inherit from StateChangingEvent", function() {
				expect(aHighlightingEvent).to(be_an_instance_of, EventCommand.StateChanging);
			});
		});
		describe("method execute", function() {
			it("should tell it's task to markActive", function() {
				expect(task).to(receive, 'markActive', "twice");
				aHighlightingEvent.execute();
			});
		});
		describe("method unwind", function() {
			it("should tell it's task to reset", function() {
				expect(task).to(receive, 'reset', "twice");
				aHighlightingEvent.unwind();
			});
		});
		describe("method animate", function() {
			it("should tell it's task to highlight", function() {
				expect(task).to(receive, 'highlight', "twice");
				aHighlightingEvent.animate();
			});
		});
	});
	
	describe("MarkFinishedEvent", function() {
		before_each(function() {
			task = newTask(htmlRenderer.createInfobox(), svgUtility.getTaskRectangle("someID"));
			aMarkFinishedEvent = new EventCommand.MarkFinished(task, {}, 123456789);
		});
		describe("inheritance", function() {
			it("should inherit from EventCommand", function() {
				expect(aMarkFinishedEvent).to(be_an_instance_of, EventCommand);
			});
			it("should inherit from StateChangingEvent", function() {
				expect(aMarkFinishedEvent).to(be_an_instance_of, EventCommand.StateChanging);
			});
		});
		describe("method execute", function() {
			it("should tell it's task to markFinished", function() {
				expect(task).to(receive, 'markFinished');
				aMarkFinishedEvent.execute();
			});
			it("should setInformation on it's task", function() {
				expect(task).to(receive, 'setInformation');
				aMarkFinishedEvent.execute();
			})
		});
		describe("method unwind", function() {
			it("should tell it's task to markActive", function() {
				expect(task).to(receive, 'markActive');
				aMarkFinishedEvent.unwind();
			});
		});
	});
	
	describe("TransferingDataEvent", function() {
		before_each(function() {
			task = newTask(htmlRenderer.createInfobox(), svgUtility.getTaskRectangle("someID"));
			stub(task, 'animateData'); // would throw a TypeError, because workflow is not initialized
			aTransferingDataEvent = new EventCommand.TransferingData(task, {}, 123456789);
		});
		describe("inheritance", function() {
			it("should inherit from EventCommand", function() {
				expect(aTransferingDataEvent).to(be_an_instance_of, EventCommand);
			});
		});
		describe("method execute", function() {
			it("should setInformation on it's task", function() {
				expect(task).to(receive, 'setInformation');
				aTransferingDataEvent.execute();
			})
		});
		describe("method animate", function() {
			it("should animateData on it's task", function() {
				expect(task).to(receive, 'animateData');
				aTransferingDataEvent.animate();
			});
		});
	});
	
	describe("SpecifyingParticipantEvent", function() {
		before_each(function() {
			taskLane = newTaskLane(svgUtility.getTaskRectangle("someID"), []);
			aSpecifyingParticipantEvent = new EventCommand.SpecifyingParticipant(taskLane, {}, 123456789);
		});
		describe("inheritance", function() {
			it("should inherit from EventCommand", function() {
				expect(aSpecifyingParticipantEvent).to(be_an_instance_of, EventCommand);
			});
		});
		describe("method execute", function() {
			it("should setInformation on it's taskLane", function() {
				expect(taskLane).to(receive, 'setInformation');
				aSpecifyingParticipantEvent.execute();
			})
		});
		describe("method animate", function() {
			it("should tell it's taskLane to highlight", function() {
				expect(taskLane).to(receive, 'highlight');
				aSpecifyingParticipantEvent.animate();
			});
		});
	});
	
	describe("", function() {
		
	});
});
